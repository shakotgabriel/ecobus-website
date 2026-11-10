import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Call, WhatsApp or email EcoBus. Offices in Juba (Atlabara, Sherikat), Bor, Nimule and Kampala.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
