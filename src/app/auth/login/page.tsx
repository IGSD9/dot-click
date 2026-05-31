import { LoginForm } from "@/app/auth/login/LoginForm";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <LoginForm />
      </main>
    </div>
  );
}
