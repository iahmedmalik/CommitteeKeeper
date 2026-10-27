import Link from "next/link";

export const metadata = { title: "This link doesn’t work", robots: { index: false } };

/** The one answer for every link that does not work: wrong, unknown or switched off. Nothing here says which. */
export default function MemberLinkNotFound() {
  return (
    <div className="prose" style={{ paddingTop: 24 }}>
      <h1>This link doesn&rsquo;t work</h1>
      <p className="mut">It may have been switched off or replaced. Ask the organiser of your committee for a new one.</p>
      <p>
        <Link className="btn secondary" href="/">
          Go to the home page
        </Link>
      </p>
    </div>
  );
}
