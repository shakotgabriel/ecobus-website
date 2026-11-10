import type { ReactNode } from "react";
import { COMPANY_EMAIL, COMPANY_PHONES, telHref } from "@/lib/company";

export const POLICY_UPDATED = "10 November 2026";

export function PolicyPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const jubaLine = COMPANY_PHONES[0].numbers[0];
  return (
    <main id="main-content" className="pt-24 pb-16 sm:pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{intro}</p>
        <p className="mt-2 text-xs text-muted-foreground">Last updated {POLICY_UPDATED}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/90 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-1.5">
          {children}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-muted/40 p-5 text-sm">
          <p className="font-semibold text-foreground">Questions?</p>
          <p className="mt-1 text-muted-foreground">
            Call us on{" "}
            <a className="font-medium text-primary hover:underline" href={telHref(jubaLine)}>
              {jubaLine}
            </a>{" "}
            or email{" "}
            <a className="font-medium text-primary hover:underline" href={`mailto:${COMPANY_EMAIL}`}>
              {COMPANY_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
