import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListLeavesQueryKey, useListLeaves, useUpdateLeave } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ClipboardList, Check, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

type LeaveRow = {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  leaveTypeName?: string | null;
  startDate: string;
  endDate: string;
  totalDays?: number | null;
  status?: string | null;
  reason?: string | null;
};

export default function LeavesList() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewing, setReviewing] = useState<LeaveRow | null>(null);
  const [note, setNote] = useState("");
  const { data: leaves, isLoading } = useListLeaves({ status: statusFilter !== "all" ? statusFilter : undefined });
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const updateMut = useUpdateLeave();
  const canReview = ["super_admin", "admin", "hr", "manager"].includes(user?.role || "");

  const statusClass = (status?: string) => status === "approved" ? "bg-primary/10 text-primary border-0" : status === "rejected" ? "bg-destructive/10 text-destructive border-0" : status === "pending" ? "bg-accent/25 text-accent-foreground border-0" : "bg-muted text-muted-foreground border-0";
  function update(status: "approved" | "rejected") {
    if (!reviewing) return;
    updateMut.mutate({ id: reviewing.id, data: { status, managerApprovalStatus: status, managerNote: note || undefined } }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListLeavesQueryKey() }); setReviewing(null); setNote(""); toast({ title: `Leave ${status}`, description: "The request has been updated." }); },
      onError: (e: any) => toast({ title: "Could not update leave", description: e.message, variant: "destructive" }),
    });
  }
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"><div><p className="eyebrow mb-2">Daily operations</p><h1 className="page-heading text-3xl font-bold">Leave requests</h1><p className="text-muted-foreground mt-2">Review time away and keep approvals moving.</p></div><Link href="/leaves/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90" data-testid="link-apply-leave"><Plus className="h-4 w-4" />Apply for leave</Link></header>
      <div className="data-surface">
        <div className="p-4 border-b border-border/60 bg-muted/25"><Tabs value={statusFilter} onValueChange={setStatusFilter}><TabsList className="bg-background/70"><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="approved">Approved</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList></Tabs></div>
        <div className="overflow-x-auto"><Table><TableHeader className="bg-muted/45"><TableRow><TableHead>Employee</TableHead><TableHead>Leave type</TableHead><TableHead>Duration</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
          {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}</TableRow>) :
            !leaves?.length ? <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground"><ClipboardList className="h-8 w-8 mx-auto mb-3 text-primary/40" />No leave requests for this view.</TableCell></TableRow> :
            leaves.map(leave => <TableRow key={leave.id} className="hover:bg-muted/25"><TableCell className="font-semibold">{leave.employeeName || `Employee #${leave.employeeId}`}</TableCell><TableCell>{leave.leaveTypeName || "—"}</TableCell><TableCell className="text-sm">{leave.startDate} <span className="text-muted-foreground">to</span> {leave.endDate}</TableCell><TableCell className="font-mono">{leave.totalDays ?? "—"}</TableCell><TableCell><Badge variant="outline" className={statusClass(leave.status)}>{leave.status?.toUpperCase()}</Badge></TableCell><TableCell className="text-right">{canReview && leave.status === "pending" ? <Button variant="ghost" size="sm" onClick={() => { setReviewing(leave); setNote(""); }} data-testid={`button-review-leave-${leave.id}`}>Review</Button> : <span className="text-xs text-muted-foreground">No action</span>}</TableCell></TableRow>)
          }
        </TableBody></Table></div>
      </div>
      <Dialog open={!!reviewing} onOpenChange={open => !open && setReviewing(null)}><DialogContent><DialogHeader><DialogTitle>Review leave request</DialogTitle></DialogHeader>{reviewing && <div className="space-y-4 py-2"><div className="rounded-xl bg-muted/50 p-4"><p className="font-semibold">{reviewing.employeeName || `Employee #${reviewing.employeeId}`}</p><p className="text-sm text-muted-foreground mt-1">{reviewing.leaveTypeName} · {reviewing.startDate} to {reviewing.endDate} · {reviewing.totalDays ?? 0} days</p><p className="text-sm mt-3">{reviewing.reason || "No reason provided."}</p></div><div className="space-y-2"><Label htmlFor="leave-review-note">Review note</Label><Textarea id="leave-review-note" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note for the employee" rows={3} /></div></div>}<DialogFooter><Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button><Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-2" onClick={() => update("rejected")} disabled={updateMut.isPending} data-testid="button-reject-leave"><X className="h-4 w-4" />Reject</Button><Button onClick={() => update("approved")} disabled={updateMut.isPending} className="gap-2" data-testid="button-approve-leave"><Check className="h-4 w-4" />Approve</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}