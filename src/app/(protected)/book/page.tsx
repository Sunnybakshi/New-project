import BookingWizard from "@/components/booking/BookingWizard";

export default function BookPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book a Dock Appointment</h1>
      <BookingWizard />
    </div>
  );
}
