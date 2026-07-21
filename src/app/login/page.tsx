import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in · Halesah Galimoto Hub" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-ink">Log in to Halesah Galimoto Hub</h1>
      <p className="mt-2 text-sm text-gray-600">
        We use your phone number, no password to remember. Verified sellers get a trust badge buyers can see.
      </p>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
