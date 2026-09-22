import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { DeveloperAuthForm } from "@/components/auth/developer-auth-form";
import { resolvePostAuthPath } from "@/lib/kailopay/auth-intent";
import { getServerSession } from "@/lib/kailopay/session";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next ?? null;
  const session = await getServerSession();

  if (session?.email_verified) {
    redirect(resolvePostAuthPath("business", nextPath));
  }

  return (
    <AuthPageShell>
      <DeveloperAuthForm defaultTab="login" nextPath={nextPath} />
    </AuthPageShell>
  );
}
