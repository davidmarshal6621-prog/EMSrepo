import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, companyRegistrationsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "ems-secret-key";

export function signToken(payload: { id: number; email: string; role: string; name: string; employeeId?: number | null }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: number; email: string; role: string; name: string; employeeId?: number | null } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name, employeeId: user.employeeId });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId,
    },
    token,
  });
});

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { companyName, ownerName, email, password, plan = "trial" } = req.body ?? {};
  if (!companyName || !ownerName || !email || !password || password.length < 8) {
    res.status(400).json({ error: "Company, name, email and a password of at least 8 characters are required" });
    return;
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, normalizedEmail));
  if (existing.length) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }
  const [registration] = await db.insert(companyRegistrationsTable).values({
    companyName: String(companyName).trim(),
    ownerName: String(ownerName).trim(),
    ownerEmail: normalizedEmail,
    plan: plan === "pro" ? "pro" : "trial",
    status: "trialing",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    maxEmployees: plan === "pro" ? 100 : 10,
    features: JSON.stringify({ attendance: true, leave: true, payroll: plan === "pro" }),
  }).returning();
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email: normalizedEmail,
    passwordHash,
    name: String(ownerName).trim(),
    role: "admin",
    isActive: true,
  }).returning();
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.status(201).json({
    company: { id: registration.id, name: registration.companyName, plan: registration.plan, status: registration.status, trialEndsAt: registration.trialEndsAt },
    user: { id: user.id, email: user.email, name: user.name, role: user.role, employeeId: user.employeeId },
    token,
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    employeeId: user.employeeId,
  });
});

export default router;
