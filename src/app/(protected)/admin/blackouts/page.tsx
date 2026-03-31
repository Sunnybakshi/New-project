import BlackoutManager from "@/components/schedule/BlackoutManager";

export default function BlackoutsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blackout Dates</h1>
      <BlackoutManager />
    </div>
  );
}
