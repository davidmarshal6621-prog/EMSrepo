import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, employeesTable, shiftSchedulesTable, shiftsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/shift-schedules", async (req, res): Promise<void> => {
  const employeeId = Number(req.query.employeeId);
  if (!employeeId) { res.status(400).json({ error: "employeeId is required" }); return; }
  const rows = await db.select().from(shiftSchedulesTable).where(eq(shiftSchedulesTable.employeeId, employeeId));
  const shifts = await db.select().from(shiftsTable);
  const shiftMap = new Map(shifts.map(s => [s.id, s]));
  res.json(rows.sort((a,b) => a.weekday-b.weekday).map(r => ({ ...r, shift: r.shiftId ? shiftMap.get(r.shiftId) ?? null : null })));
});

router.put("/shift-schedules", async (req, res): Promise<void> => {
  const { employeeId, schedule } = req.body as { employeeId?: number; schedule?: Array<{ weekday: number; shiftId?: number | null; isOff?: boolean }> };
  if (!employeeId || !Array.isArray(schedule)) { res.status(400).json({ error: "employeeId and schedule are required" }); return; }
  const [employee] = await db.select({ id: employeesTable.id }).from(employeesTable).where(eq(employeesTable.id, employeeId));
  if (!employee) { res.status(404).json({ error: "Employee not found" }); return; }
  const clean = schedule.filter(s => Number.isInteger(s.weekday) && s.weekday >= 0 && s.weekday <= 6);
  for (const item of clean) {
    const values = { employeeId, weekday: item.weekday, shiftId: item.isOff ? null : (item.shiftId ?? null), isOff: Boolean(item.isOff) };
    const existing = await db.select({ id: shiftSchedulesTable.id }).from(shiftSchedulesTable).where(and(eq(shiftSchedulesTable.employeeId, employeeId), eq(shiftSchedulesTable.weekday, item.weekday)));
    if (existing[0]) await db.update(shiftSchedulesTable).set(values).where(eq(shiftSchedulesTable.id, existing[0].id));
    else await db.insert(shiftSchedulesTable).values(values);
  }
  const rows = await db.select().from(shiftSchedulesTable).where(eq(shiftSchedulesTable.employeeId, employeeId));
  res.json(rows.sort((a,b) => a.weekday-b.weekday));
});

export default router;
