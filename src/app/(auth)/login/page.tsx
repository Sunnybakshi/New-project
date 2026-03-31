import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DockScheduler</h1>
          <p className="text-gray-600 mt-2">Warehouse dock scheduling platform</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
