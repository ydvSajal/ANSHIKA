import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

const NAV = [
  { to: "/student", label: "Home" },
  { to: "/student/food", label: "Food" },
  { to: "/student/rides", label: "Rides" },
  { to: "/student/medical", label: "Medical" },
  { to: "/student/notes", label: "Notes" },
];

function StudentLayout() {
  return (
    <RoleGuard allow={["student"]}>
      <Shell nav={NAV} title="STUDENT_TERMINAL">
        <Outlet />
      </Shell>
    </RoleGuard>
  );
}
