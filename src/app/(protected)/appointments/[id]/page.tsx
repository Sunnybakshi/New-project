import AppointmentDetailView from "@/components/appointments/AppointmentDetailView";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppointmentDetailView id={id} />;
}
