import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  FolderTree,
  Gauge,
  LogOut,
  PenSquare,
  Settings,
  Home,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/my-supabase/client";

const items = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: Gauge },
  { title: "নিউজ লিখুন", url: "/admin/write", icon: PenSquare },
  { title: "সব নিউজ", url: "/admin/posts", icon: FileText },
  { title: "ক্যাটাগরি", url: "/admin/categories", icon: FolderTree },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string | null }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <span className="font-display text-base font-bold text-primary">
          প্রভাতবাংলা অ্যাডমিন
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ম্যানেজমেন্ট</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>সাইট</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="size-4" />
                    <span>হোমপেজ দেখুন</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await supabase.auth.signOut();
                void navigate({ to: "/auth", search: { mode: "login" } });
              }}
            >
              <LogOut className="size-4" />
              <span className="truncate">{email ?? "লগআউট"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
