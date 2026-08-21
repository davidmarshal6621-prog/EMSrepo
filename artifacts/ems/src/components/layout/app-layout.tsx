import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, FileText, DollarSign,
  Building2, GitBranch, Clock, UserCog, Cpu, ChevronRight,
  ScanLine, Settings, Menu, X, LogOut, CircleUserRound,
} from "lucide-react";

function NavLink({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      }`}
      data-testid={`link-nav-${href.replace(/\//g, "-").replace(/^-/, "")}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
      {isActive && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 pb-1 px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
      {children}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const isAdmin = user?.role === "super_admin" || user?.role === "admin";
  const isAdminOrHr = isAdmin || user?.role === "hr";

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {mobileOpen && <button aria-label="Close navigation" data-testid="button-close-navigation" className="fixed inset-0 z-30 bg-foreground/30 md:hidden" onClick={() => setMobileOpen(false)} />}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[17rem] bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col shrink-0 transition-transform duration-200 md:relative md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-base shadow-sm">E</div>
            <div>
              <div className="font-bold text-sm leading-tight tracking-tight">EMS Portal</div>
              <div className="text-[10px] text-sidebar-foreground/50 uppercase tracking-[.14em] mt-1">People operations</div>
            </div>
          </div>
          <button aria-label="Close navigation" data-testid="button-close-navigation-sidebar" className="absolute right-4 top-5 p-1 text-sidebar-foreground/50 md:hidden" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>

          {/* Workforce */}
          {isAdminOrHr && (
            <>
              <SectionLabel>Workforce</SectionLabel>
              <NavLink href="/employees" icon={Users}>Employees</NavLink>
            </>
          )}

          {/* Daily */}
          <SectionLabel>Daily</SectionLabel>
          <NavLink href="/attendance" icon={CalendarCheck}>Attendance</NavLink>
          {isAdminOrHr && (
            <NavLink href="/attendance/punch-logs" icon={ScanLine}>Punch Logs</NavLink>
          )}
          <NavLink href="/leaves" icon={FileText}>Leave Requests</NavLink>

          {/* Finance */}
          {isAdminOrHr && (
            <>
              <SectionLabel>Finance</SectionLabel>
              <NavLink href="/payroll" icon={DollarSign}>Payroll</NavLink>
            </>
          )}

          {/* Configuration */}
          {isAdminOrHr && (
            <>
              <SectionLabel>Configuration</SectionLabel>
              <NavLink href="/departments" icon={Building2}>Departments</NavLink>
              {isAdmin && (
                <>
                  <NavLink href="/branches" icon={GitBranch}>Branches</NavLink>
                  <NavLink href="/shifts" icon={Clock}>Shifts</NavLink>
                  <NavLink href="/users" icon={UserCog}>Users</NavLink>
                  <NavLink href="/devices" icon={Cpu}>ZKTeco Devices</NavLink>
                </>
              )}
            </>
          )}

          {/* Settings */}
          {isAdmin && (
            <>
              <SectionLabel>Settings</SectionLabel>
              <NavLink href="/settings/company" icon={Settings}>Company Settings</NavLink>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
             <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role?.replace(/_/g, " ")}</div>
            </div>
          </div>
           <Button variant="secondary" size="sm" className="w-full justify-center gap-2 bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 border-0" onClick={handleLogout} data-testid="button-sign-out">
             <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 bg-background/90 backdrop-blur px-4 py-3 md:hidden">
          <button aria-label="Open navigation" data-testid="button-open-navigation" className="rounded-lg p-2 hover:bg-muted" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-2 text-sm font-semibold"><CircleUserRound className="h-4 w-4 text-primary" />{user?.name}</div>
          <div className="w-9" />
        </div>
         <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
           <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
