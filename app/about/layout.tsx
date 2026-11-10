import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "EcoBus connects Juba with Bor, Nimule, Kampala and Nairobi. Learn about our fleet, safety standards and team.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
