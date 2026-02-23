import Footer from "@/components/Footer";

// All pages in this route group automatically get the Footer.
// The route group (marketing) does not affect URLs.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
