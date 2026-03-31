import { auth } from "@/lib/auth";
import dynamic from "next/dynamic";
import CarrierDashboard from "@/components/dashboard/CarrierDashboard";

const StaffCalendar = dynamic(
  () => import("@/components/dashboard/StaffCalendar"),
  { ssr: false }
);

export default async function DashboardPage() {
  const session = await auth();

  if (session?.user?.role === "STAFF") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Appointments Calendar
        </h1>
        <StaffCalendar />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
      <CarrierDashboard />
    </div>
  );
}
