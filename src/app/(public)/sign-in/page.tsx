import { AuthForm } from "@/components/AuthForm";
import { PageTransition } from "@/components/PageTransition";
import { PopText } from "@/components/PopText";
import { safeNext } from "@/lib/access";

export const metadata = { title: "Sign in" };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  return (
    <PageTransition>
      <div className="authcard">
        <PopText text="Sign in" />
        <p className="mut rise" style={{ ["--i" as string]: 2, marginBottom: 20 }}>
          Welcome back.
        </p>
        <div className="rise" style={{ ["--i" as string]: 3 }}>
          <AuthForm mode="sign-in" next={next} />
        </div>
      </div>
    </PageTransition>
  );
}
