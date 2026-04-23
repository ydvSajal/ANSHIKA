import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/faculty")({
  component: FacultyLayout,
});

const NAV = [
  { to: "/faculty", label: "Subjects" },
  { to: "/faculty/upload", label: "Upload Notes" },
];

function FacultyLayout() {
  return (
    <RoleGuard allow={["faculty", "admin"]}>
      <Shell nav={NAV} title="FACULTY_TERMINAL">
        <Outlet />
      </Shell>
    </RoleGuard>
  );
}
