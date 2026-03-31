import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
