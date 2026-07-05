"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Layers,
  Container,
  Globe,
  ScrollText,
  Activity,
  LayoutDashboard,
  FileJson,
  Key,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Deployments", icon: Layers },
  { href: "/dashboard/pods", label: "Pods", icon: Container },
  { href: "/dashboard/services", label: "Services", icon: Globe },
  { href: "/dashboard/namespaces", label: "Namespaces", icon: LayoutDashboard },
  { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
  { href: "/dashboard/events", label: "Events", icon: Activity },
];

const configItems = [
  { href: "/dashboard/configmaps", label: "ConfigMaps", icon: FileJson },
  { href: "/dashboard/secrets", label: "Secrets", icon: Key },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar className="border-r border-white/[0.06]">
      <SidebarHeader className="px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow text-yellow-foreground">
            <Box className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight block">
              DeployBoard
            </span>
            <span className="text-[10px] text-muted-foreground">
              Kubernetes Dashboard
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="h-9"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4 mt-4">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="h-9"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 space-y-4">
        {session?.user && (
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {session.user.name || session.user.email}
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[10px] text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">
            Mode
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow animate-pulse" />
            <span className="text-xs text-muted-foreground">Demo Mode</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
