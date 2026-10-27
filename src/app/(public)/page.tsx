import { PageTransition } from "@/components/PageTransition";
import { PopText } from "@/components/PopText";
import { site } from "@/lib/site";

// Placeholder landing. The real landing page comes with the sign-up work (issue #4).
export default function Home() {
  return (
    <PageTransition>
      <div className="prose" style={{ paddingTop: 40 }}>
        <PopText text={site.name} />
        <p className="rise" style={{ ["--i" as string]: 3 }}>{site.tagline}</p>
        <p className="mut rise" style={{ ["--i" as string]: 4 }}>{site.description}</p>
      </div>
    </PageTransition>
  );
}
