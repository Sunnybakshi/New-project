"use client";

import { useState } from "react";
import StepPickDate from "./StepPickDate";
import StepPickSlot from "./StepPickSlot";
import StepConfirm from "./StepConfirm";
import type { LoadType } from "@/types";

export type BookingState = {
  date: string | null;
  dockId: string | null;
  dockName: string | null;
  startTime: string | null;
  endTime: string | null;
  loadType: LoadType;
  poNumber: string;
  notes: string;
  truckLicense: string;
  driverName: string;
};

const INITIAL_STATE: BookingState = {
  date: null,
  dockId: null,
  dockName: null,
  startTime: null,
  endTime: null,
  loadType: "INBOUND",
  poNumber: "",
  notes: "",
  truckLicense: "",
  driverName: "",
};

const STEPS = ["Select Date", "Select Slot", "Confirm"];

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);

  function updateBooking(updates: Partial<BookingState>) {
    setBooking((prev) => ({ ...prev, ...updates }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm hidden sm:block ${
                  i === step ? "font-medium text-gray-900" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <StepPickDate
          onDateSelected={(date) => {
            updateBooking({ date, dockId: null, dockName: null, startTime: null, endTime: null });
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <StepPickSlot
          date={booking.date!}
          onSlotSelected={(slot) => {
            updateBooking({
              dockId: slot.dockId,
              dockName: slot.dockName,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
            setStep(2);
          }}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <StepConfirm
          booking={booking}
          onUpdate={updateBooking}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
