import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Activity, ArrowUpRight, CalendarCheck, ClipboardList, Clock3, DollarSign,
  FileClock, UserCheck, UserPlus, UserX, Users, WalletCards,
} from "lucide-react";

function Metric({ label, value, detail, icon: Icon, tone = "teal" }: { label: string; value: string | number; detail: string; icon: any; tone?: "teal" | "gold" | "red" | "blue" }) {
  const tones = {
    teal: "bg-primary/10 text-primary",
    gold: "bg-accent/25 text-accent-foreground",
    red: "bg-destructive/10 text-destructive",
    blue: "bg-sky-100 text-sky-800",
  };
  return (
    <Card className="metric-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-bold tracking-[-.05em]">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin" || user?.role === "admin" || user?.role === "hr";
  const { data: stats, isLoading, isError, refetch } = useGetDashboardStats();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-2">Operations overview</p>
          <h1 className="page-heading text-3xl sm:text-4xl font-bold">Good morning, {firstName}.</h1>
          <p className="mt-2 text-muted-foreground">Here is the pulse of your workplace today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4 text-primary" />
          <span>{new Intl.DateTimeFormat("en-PK", { weekday: "long", day: "numeric", month: "short" }).format(new Date())}</span>
        </div>
      </header>

      {isAdmin ? (
        <>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
          ) : isError ? (
            <Card className="border-destructive/25 bg-destructive/5"><CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="font-semibold">Dashboard data is unavailable</p><p className="text-sm text-muted-foreground mt-1">Try again or use the navigation to continue working.</p></div><button className="text-sm font-semibold text-primary hover:underline" onClick={() => refetch()} data-testid="button-retry-dashboard">Retry</button></CardContent></Card>
          ) : stats ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Total employees" value={stats.totalEmployees} detail="Across your organisation" icon={Users} />
                <Metric label="Present today" value={stats.presentToday} detail={`${stats.attendanceRate ?? 0}% attendance rate`} icon={UserCheck} tone="gold" />
                <Metric label="Absent today" value={stats.absentToday} detail={`${stats.onLeaveToday} people on leave`} icon={UserX} tone="red" />
                <Metric label="Pending leaves" value={stats.pendingLeaves} detail="Waiting for review" icon={FileClock} tone="blue" />
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.4fr_.85fr]">
                <Card className="data-surface">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
                    <div><p className="eyebrow mb-1">Today</p><CardTitle className="text-lg">Attendance snapshot</CardTitle></div>
                    <Link href="/attendance" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline" data-testid="link-dashboard-attendance">Open attendance <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex items-end justify-between mb-3"><span className="text-sm text-muted-foreground">Team attendance</span><span className="font-mono text-sm">{stats.attendanceRate ?? 0}%</span></div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, stats.attendanceRate ?? 0)}%` }} /></div>
                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <div><div className="text-xl font-bold">{stats.presentToday}</div><div className="text-xs text-muted-foreground">Present</div></div>
                      <div><div className="text-xl font-bold">{stats.absentToday}</div><div className="text-xs text-muted-foreground">Absent</div></div>
                      <div><div className="text-xl font-bold">{stats.onLeaveToday}</div><div className="text-xs text-muted-foreground">On leave</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="data-surface">
                  <CardHeader className="border-b border-border/60 px-5 py-4"><p className="eyebrow mb-1">Finance</p><CardTitle className="text-lg">This month’s payroll</CardTitle></CardHeader>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-accent/25 flex items-center justify-center"><WalletCards className="h-5 w-5 text-accent-foreground" /></div><div><div className="text-2xl font-bold tracking-tight">PKR {(stats.payrollThisMonth ?? 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Total net salary</div></div></div>
                    <Link href="/payroll" className="mt-7 flex items-center justify-between border-t border-border/60 pt-4 text-sm font-semibold text-primary" data-testid="link-dashboard-payroll">Review payroll <ArrowUpRight className="h-4 w-4" /></Link>
                  </CardContent>
                </Card>
              </div>

              <Card className="data-surface">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4"><div><p className="eyebrow mb-1">Needs attention</p><CardTitle className="text-lg">Leave requests</CardTitle></div><Link href="/leaves" className="text-xs font-semibold text-primary hover:underline" data-testid="link-dashboard-leaves">View all</Link></CardHeader>
                <CardContent className="p-0">
                  {stats.pendingLeaveRequests?.length ? stats.pendingLeaveRequests.slice(0, 5).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/50 last:border-0">
                      <div className="min-w-0"><p className="font-medium truncate">{leave.employeeName || `Employee #${leave.employeeId}`}</p><p className="text-xs text-muted-foreground mt-1">{leave.startDate} to {leave.endDate} · {leave.totalDays ?? 0} days</p></div><Badge className="bg-accent/25 text-accent-foreground border-0 shrink-0">Pending</Badge>
                    </div>
                  )) : <div className="p-8 text-center text-sm text-muted-foreground">No leave requests are waiting for review.</div>}
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <Card className="data-surface bg-primary text-primary-foreground border-0"><CardContent className="p-7"><p className="eyebrow text-accent mb-3">Your workspace</p><h2 className="text-2xl font-bold tracking-tight">Keep your day in view.</h2><p className="mt-2 text-primary-foreground/70 leading-relaxed">Check your attendance history or send a leave request when plans change.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/attendance" className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary" data-testid="link-employee-attendance">My attendance <ArrowUpRight className="h-4 w-4" /></Link><Link href="/leaves/new" className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/25 px-4 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="link-employee-leave">Apply for leave <ArrowUpRight className="h-4 w-4" /></Link></div></CardContent></Card>
          <Card className="data-surface"><CardHeader className="px-6 pt-6"><p className="eyebrow mb-1">Quick access</p><CardTitle className="text-lg">Common actions</CardTitle></CardHeader><CardContent className="grid gap-2 p-4"><Link href="/attendance" className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors" data-testid="link-quick-attendance"><div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><CalendarCheck className="h-4 w-4" /></div><div><p className="text-sm font-semibold">View attendance</p><p className="text-xs text-muted-foreground">Review your recent days</p></div><ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" /></Link><Link href="/leaves/new" className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted transition-colors" data-testid="link-quick-leave"><div className="h-9 w-9 rounded-lg bg-accent/25 text-accent-foreground flex items-center justify-center"><ClipboardList className="h-4 w-4" /></div><div><p className="text-sm font-semibold">Apply for leave</p><p className="text-xs text-muted-foreground">Send a new request</p></div><ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" /></Link></CardContent></Card>
        </div>
      )}
    </div>
  );
}