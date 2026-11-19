import Header from "../components/header";

// Revalidate site pages every 60s so Sanity edits show up without a redeploy.
export const revalidate = 60;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <footer className="mt-auto py-10 text-center text-sm">
        <p>© 2026 Joel Goh</p>
      </footer>
    </>
  );
}
