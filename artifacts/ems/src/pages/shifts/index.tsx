import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListShiftsQueryKey, useCreateShift, useListShifts, useUpdateShift } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Clock, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ShiftForm = { name: string; startTime: string; endTime: string; gracePeriodMinutes: string };
const blank: ShiftForm = { name: "", startTime: "09:00", endTime: "17:00", gracePeriodMinutes: "15" };

export default function ShiftsList() {
  const { data: shifts, isLoading } = useListShifts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<ShiftForm>(blank);
  const qc = useQueryClient();
  const { toast } = useToast();
  const createMut = useCreateShift();
  const updateMut = useUpdateShift();
  const pending = createMut.isPending || updateMut.isPending;
  function openCreate() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(shift: NonNullable<typeof shifts>[number]) { setEditing(shift.id); setForm({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime, gracePeriodMinutes: String(shift.gracePeriodMinutes ?? 15) }); setOpen(true); }
  function save() {
    if (!form.name.trim()) { toast({ title: "Shift name is required", variant: "destructive" }); return; }
    const data = { name: form.name, startTime: form.startTime, endTime: form.endTime, gracePeriodMinutes: Number(form.gracePeriodMinutes) || 0 };
    const done = () => { qc.invalidateQueries({ queryKey: getListShiftsQueryKey() }); setOpen(false); toast({ title: editing ? "Shift updated" : "Shift created" }); };
    if (editing) updateMut.mutate({ id: editing, data }, { onSuccess: done, onError: (e: any) => toast({ title: "Could not update shift", description: e.message, variant: "destructive" }) });
    else createMut.mutate({ data }, { onSuccess: done, onError: (e: any) => toast({ title: "Could not create shift", description: e.message, variant: "destructive" }) });
  }
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"><div><p className="eyebrow mb-2">Configuration</p><h1 className="page-heading text-3xl font-bold">Working shifts</h1><p className="text-muted-foreground mt-2">Set the hours and grace periods used by attendance.</p></div><Button onClick={openCreate} className="gap-2" data-testid="button-add-shift"><Plus className="h-4 w-4" />Add shift</Button></header>
      <div className="data-surface"><Table><TableHeader className="bg-muted/45"><TableRow><TableHead>Shift</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Working hours</TableHead><TableHead>Grace period</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>) :
          !shifts?.length ? <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground"><Clock className="h-8 w-8 mx-auto mb-3 text-primary/40" />No shifts found yet.</TableCell></TableRow> :
          shifts.map(shift => <TableRow key={shift.id} className="hover:bg-muted/25"><TableCell className="font-semibold">{shift.name}</TableCell><TableCell className="font-mono text-sm">{shift.startTime}</TableCell><TableCell className="font-mono text-sm">{shift.endTime}</TableCell><TableCell>{shift.workingHours ?? "—"} hrs</TableCell><TableCell>{shift.gracePeriodMinutes ?? 0} mins</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(shift)} data-testid={`button-edit-shift-${shift.id}`}><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</Button></TableCell></TableRow>)
        }
      </TableBody></Table></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "Edit shift" : "Add shift"}</DialogTitle></DialogHeader><div className="space-y-4 py-2"><div className="space-y-2"><Label htmlFor="shift-name">Shift name</Label><Input id="shift-name" data-testid="input-shift-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Morning shift" /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="shift-start">Start time</Label><Input id="shift-start" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="shift-end">End time</Label><Input id="shift-end" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div></div><div className="space-y-2"><Label htmlFor="shift-grace">Grace period (minutes)</Label><Input id="shift-grace" type="number" min="0" value={form.gracePeriodMinutes} onChange={e => setForm({ ...form, gracePeriodMinutes: e.target.value })} /></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={pending} data-testid="button-save-shift">{pending ? "Saving..." : editing ? "Save changes" : "Create shift"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}