import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/orders", label: "Food Orders" },
  { to: "/admin/users", label: "Users" },
];

function AdminLayout() {
  return (
    <RoleGuard allow={["admin"]}>
      <Shell nav={NAV} title="ADMIN_TERMINAL">
        <Outlet />
      </Shell>
    </RoleGuard>
  );
}
