import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDepartmentsQueryKey, useCreateDepartment, useListBranches, useListDepartments, useListUsers, useUpdateDepartment } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type DepartmentForm = { name: string; branchId: string; managerId: string };
const blank: DepartmentForm = { name: "", branchId: "", managerId: "" };

export default function DepartmentsList() {
  const { data: departments, isLoading } = useListDepartments();
  const { data: branches = [] } = useListBranches();
  const { data: users = [] } = useListUsers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<DepartmentForm>(blank);
  const qc = useQueryClient();
  const { toast } = useToast();
  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const pending = createMut.isPending || updateMut.isPending;

  function openCreate() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(dept: NonNullable<typeof departments>[number]) { setEditing(dept.id); setForm({ name: dept.name, branchId: dept.branchId ? String(dept.branchId) : "", managerId: dept.managerId ? String(dept.managerId) : "" }); setOpen(true); }
  function save() {
    if (!form.name.trim()) { toast({ title: "Department name is required", variant: "destructive" }); return; }
    const data = { name: form.name, branchId: form.branchId ? Number(form.branchId) : null, managerId: form.managerId ? Number(form.managerId) : null };
    const done = () => { qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() }); setOpen(false); toast({ title: editing ? "Department updated" : "Department created" }); };
    if (editing) updateMut.mutate({ id: editing, data }, { onSuccess: done, onError: (e: any) => toast({ title: "Could not update department", description: e.message, variant: "destructive" }) });
    else createMut.mutate({ data }, { onSuccess: done, onError: (e: any) => toast({ title: "Could not create department", description: e.message, variant: "destructive" }) });
  }
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"><div><p className="eyebrow mb-2">Configuration</p><h1 className="page-heading text-3xl font-bold">Departments</h1><p className="text-muted-foreground mt-2">Organise teams and connect them to a branch or manager.</p></div><Button onClick={openCreate} className="gap-2" data-testid="button-add-department"><Plus className="h-4 w-4" />Add department</Button></header>
      <div className="data-surface"><Table><TableHeader className="bg-muted/45"><TableRow><TableHead>Department</TableHead><TableHead>Branch</TableHead><TableHead>Manager</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}</TableRow>) :
          !departments?.length ? <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground"><Building className="h-8 w-8 mx-auto mb-3 text-primary/40" />No departments found yet.</TableCell></TableRow> :
          departments.map(dept => <TableRow key={dept.id} className="hover:bg-muted/25"><TableCell className="font-semibold">{dept.name}</TableCell><TableCell>{dept.branchName || "—"}</TableCell><TableCell>{dept.managerName || "—"}</TableCell><TableCell><Badge variant="outline" className={dept.isActive ? "bg-primary/10 text-primary border-0" : ""}>{dept.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(dept)} data-testid={`button-edit-department-${dept.id}`}><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</Button></TableCell></TableRow>)
        }
      </TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit department" : "Add department"}</DialogTitle></DialogHeader><div className="space-y-4 py-2"><div className="space-y-2"><Label htmlFor="department-name">Department name</Label><Input id="department-name" data-testid="input-department-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Branch</Label><Select value={form.branchId || "none"} onValueChange={v => setForm({ ...form, branchId: v === "none" ? "" : v })}><SelectTrigger><SelectValue placeholder="No branch" /></SelectTrigger><SelectContent><SelectItem value="none">No branch</SelectItem>{branches.map(branch => <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Manager</Label><Select value={form.managerId || "none"} onValueChange={v => setForm({ ...form, managerId: v === "none" ? "" : v })}><SelectTrigger><SelectValue placeholder="No manager" /></SelectTrigger><SelectContent><SelectItem value="none">No manager</SelectItem>{users.filter(u => ["manager", "hr", "admin"].includes(u.role)).map(user => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={pending} data-testid="button-save-department">{pending ? "Saving..." : editing ? "Save changes" : "Create department"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}