import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ companyName: "", ownerName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setPending(true);
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create workspace");
      login(data.user, data.token); setLocation("/dashboard");
    } catch (err: any) { setError(err.message); } finally { setPending(false); }
  }
  return <div className="min-h-screen grid lg:grid-cols-[.9fr_1.1fr] bg-background">
    <section className="hidden lg:flex bg-sidebar text-sidebar-foreground p-12 xl:p-20 flex-col justify-between relative overflow-hidden">
      <div className="relative z-10 flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-lg">E</div><div><div className="font-bold">EMS Portal</div><div className="text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/50">People operations</div></div></div>
      <div className="relative z-10 max-w-lg"><p className="eyebrow text-sidebar-primary mb-5">Start with clarity</p><h1 className="text-5xl font-bold leading-[1.02] tracking-[-.055em]">Your team’s work, in one calm place.</h1><p className="mt-6 text-lg leading-relaxed text-sidebar-foreground/65">Create a workspace and get 14 days of full access to attendance, leave and payroll tools.</p><div className="mt-9 grid gap-4 text-sm text-sidebar-foreground/75"><div className="flex gap-3 items-center"><CheckCircle2 className="h-4 w-4 text-sidebar-primary" />No card required for the trial</div><div className="flex gap-3 items-center"><CheckCircle2 className="h-4 w-4 text-sidebar-primary" />Built for Pakistani workplaces</div></div></div>
      <div className="relative z-10 text-xs text-sidebar-foreground/45 flex justify-between"><span>Employee Management System</span><span>PKT · PKR</span></div>
      <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full border-[24px] border-sidebar-primary/20" />
    </section>
    <main className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-md">
      <div className="lg:hidden flex items-center gap-3 mb-12"><div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">E</div><div className="font-bold">EMS Portal</div></div>
      <div className="mb-8"><div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6"><Building2 className="h-5 w-5" /></div><p className="eyebrow mb-3">New workspace</p><h2 className="text-3xl font-bold tracking-[-.04em]">Create your company</h2><p className="text-muted-foreground mt-2">Start a 14-day trial and invite your team when you’re ready.</p></div>
      <form onSubmit={submit} className="space-y-4">
        {([["companyName","Company name","e.g. Acme Pakistan"],["ownerName","Your name","Full name"],["email","Work email","you@company.pk"],["password","Password","At least 8 characters"]] as const).map(([key,label,placeholder]) => <div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><Input id={key} type={key === "password" ? "password" : key === "email" ? "email" : "text"} placeholder={placeholder} autoComplete={key === "password" ? "new-password" : key === "email" ? "email" : "name"} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required /></div>)}
        {error && <p className="text-sm text-destructive">{error}</p>}<Button className="w-full h-11 gap-2" disabled={pending}>{pending ? "Creating workspace..." : <>Create workspace <ArrowRight className="h-4 w-4" /></>}</Button>
      </form><p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
    </div></main>
  </div>;
}