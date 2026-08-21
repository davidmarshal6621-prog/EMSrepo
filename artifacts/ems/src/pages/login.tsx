import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2, LockKeyhole, UsersRound } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loginMutation = useLogin();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        login(data.user, data.token);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.05fr_.95fr] bg-background">
      <section className="hidden lg:flex relative overflow-hidden bg-sidebar text-sidebar-foreground p-12 xl:p-20 flex-col justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[32px] border-sidebar-primary/15" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border-[48px] border-sidebar-primary/10" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-xl">E</div>
            <div><div className="font-bold tracking-tight text-lg">EMS Portal</div><div className="text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/50">People operations</div></div>
          </div>
        </div>
        <div className="relative max-w-xl">
          <p className="eyebrow text-sidebar-primary mb-5">Built for Pakistani workplaces</p>
          <h1 className="text-5xl xl:text-6xl font-bold leading-[1.02] tracking-[-.055em]">A clearer day at work starts here.</h1>
          <p className="mt-6 text-sidebar-foreground/65 text-lg leading-relaxed max-w-md">Keep attendance, people records, leave and payroll in one dependable place for your team.</p>
          <div className="mt-10 grid gap-4 text-sm text-sidebar-foreground/75">
            <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-sidebar-primary" />Simple approvals for busy HR teams</div>
            <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-sidebar-primary" />Role-aware access for every employee</div>
            <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-sidebar-primary" />Attendance that stays close to the source</div>
          </div>
        </div>
        <div className="relative flex items-center justify-between text-xs text-sidebar-foreground/45"><span>Employee Management System</span><span>PKT · PKR</span></div>
      </section>
      <main className="flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">E</div>
          <div><div className="font-bold">EMS Portal</div><div className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">People operations</div></div>
        </div>
        <div className="mb-9">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6"><LockKeyhole className="h-5 w-5" /></div>
          <p className="eyebrow mb-3">Secure workspace</p>
          <h2 className="text-3xl font-bold tracking-[-.04em]">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to continue to your company workspace.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input data-testid="input-email"
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.pk"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input data-testid="input-password" autoComplete="current-password"
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>
          <Button data-testid="button-submit-login" type="submit" className="w-full h-11 gap-2" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Checking your access..." : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>
        <div className="mt-9 rounded-xl border border-border/70 bg-muted/35 p-4 flex gap-3">
          <UsersRound className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-muted-foreground">Access follows your role. Contact your HR administrator if you need help signing in.</p>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">New company? <a href="/signup" className="text-primary font-semibold hover:underline">Create a workspace</a></p>
        <p className="mt-8 text-center text-xs text-muted-foreground/70">Protected company workspace · {new Date().getFullYear()}</p>
      </div>
      </main>
    </div>
  );
}
