import nodemailer from "nodemailer";
import type { AppointmentWithRelations } from "@/types";
import { formatTimeDisplay } from "./utils";
import { format } from "date-fns";

function getTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendAppointmentConfirmation(
  appt: AppointmentWithRelations
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const dateStr = format(new Date(appt.date), "EEEE, MMMM d, yyyy");
  const timeStr = `${formatTimeDisplay(appt.startTime)} - ${formatTimeDisplay(appt.endTime)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: appt.carrier.email,
    subject: `Appointment Booked - ${appt.dock.name} on ${dateStr}`,
    html: `
      <h2>Appointment Confirmation</h2>
      <p>Your appointment has been booked and is pending confirmation.</p>
      <ul>
        <li><strong>Dock:</strong> ${appt.dock.name}</li>
        <li><strong>Date:</strong> ${dateStr}</li>
        <li><strong>Time:</strong> ${timeStr}</li>
        <li><strong>Load Type:</strong> ${appt.loadType}</li>
        <li><strong>Status:</strong> ${appt.status}</li>
      </ul>
    `,
  });
}

export async function sendStatusChangeEmail(
  appt: AppointmentWithRelations
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const dateStr = format(new Date(appt.date), "EEEE, MMMM d, yyyy");
  const timeStr = `${formatTimeDisplay(appt.startTime)} - ${formatTimeDisplay(appt.endTime)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: appt.carrier.email,
    subject: `Appointment ${appt.status} - ${appt.dock.name}`,
    html: `
      <h2>Appointment Status Update</h2>
      <p>Your appointment status has changed to <strong>${appt.status}</strong>.</p>
      <ul>
        <li><strong>Dock:</strong> ${appt.dock.name}</li>
        <li><strong>Date:</strong> ${dateStr}</li>
        <li><strong>Time:</strong> ${timeStr}</li>
      </ul>
    `,
  });
}
