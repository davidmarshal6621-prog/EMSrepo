import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListBranchesQueryKey, useCreateBranch, useListBranches, useUpdateBranch } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, MapPin, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type BranchForm = { name: string; address: string; city: string; phone: string };
const blank: BranchForm = { name: "", address: "", city: "", phone: "" };

export default function BranchesList() {
  const { data: branches, isLoading } = useListBranches();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<BranchForm>(blank);
  const qc = useQueryClient();
  const { toast } = useToast();
  const createMut = useCreateBranch();
  const updateMut = useUpdateBranch();
  const pending = createMut.isPending || updateMut.isPending;

  function openCreate() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(branch: NonNullable<typeof branches>[number]) { setEditing(branch.id); setForm({ name: branch.name, address: branch.address || "", city: branch.city || "", phone: branch.phone || "" }); setOpen(true); }
  function save() {
    if (!form.name.trim()) { toast({ title: "Branch name is required", variant: "destructive" }); return; }
    const done = () => { qc.invalidateQueries({ queryKey: getListBranchesQueryKey() }); setOpen(false); toast({ title: editing ? "Branch updated" : "Branch created", description: "The branch list is up to date." }); };
    if (editing) updateMut.mutate({ id: editing, data: form }, { onSuccess: done, onError: (e: any) => toast({ title: "Could not update branch", description: e.message, variant: "destructive" }) });
    else createMut.mutate({ data: form }, { onSuccess: done, onError: (e: any) => toast({ title: "Could not create branch", description: e.message, variant: "destructive" }) });
  }
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div><p className="eyebrow mb-2">Configuration</p><h1 className="page-heading text-3xl font-bold">Branches</h1><p className="text-muted-foreground mt-2">Manage company office locations and their contact details.</p></div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-add-branch"><Plus className="h-4 w-4" />Add branch</Button>
      </header>
      <div className="data-surface">
        <Table><TableHeader className="bg-muted/45"><TableRow><TableHead>Branch name</TableHead><TableHead>City</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}</TableRow>) :
            !branches?.length ? <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground"><MapPin className="h-8 w-8 mx-auto mb-3 text-primary/40" />No branches found yet.</TableCell></TableRow> :
            branches.map(branch => <TableRow key={branch.id} className="hover:bg-muted/25"><TableCell className="font-semibold">{branch.name}<div className="text-xs text-muted-foreground font-normal">{branch.address || "No address provided"}</div></TableCell><TableCell>{branch.city || "—"}</TableCell><TableCell>{branch.phone || "—"}</TableCell><TableCell><Badge variant="outline" className={branch.isActive ? "bg-primary/10 text-primary border-0" : ""}>{branch.isActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(branch)} data-testid={`button-edit-branch-${branch.id}`}><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</Button></TableCell></TableRow>)
          }
        </TableBody></Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit branch" : "Add branch"}</DialogTitle></DialogHeader><div className="grid gap-4 py-2"><div className="space-y-2"><Label htmlFor="branch-name">Branch name</Label><Input id="branch-name" data-testid="input-branch-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="branch-city">City</Label><Input id="branch-city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="branch-address">Address</Label><Input id="branch-address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="branch-phone">Phone</Label><Input id="branch-phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={pending} data-testid="button-save-branch">{pending ? "Saving..." : editing ? "Save changes" : "Create branch"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}