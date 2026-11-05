import type { ReactNode } from "react";

type Tone = "danger" | "danger-solid" | "success" | "neutral" | "new";

const toneClasses: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger",
  // Opaque version of "danger" — the translucent tint reads fine on the
  // plain page background but nearly disappears over a product photo, since
  // a 10%-alpha fill barely dims whatever's underneath it (audit, 2026-09-10).
  // Use this instead wherever the badge sits on top of an image.
  "danger-solid": "bg-danger text-white shadow-sm",
  success: "bg-success-soft text-success",
  // "Ожидаем поставку" — opaque for the same over-a-photo reason as danger-solid.
  neutral: "bg-surface-inverse text-foreground-on-dark shadow-sm",
  // «Новинка» — glossy gold with dark brown text, as the client's reference
  // (colours sampled from her screenshot, 2026-11-05). Opaque: sits on photos too.
  new: "bg-[linear-gradient(100deg,#d8a65f,#f1c98c_45%,#fadfb0_70%,#daa863)] text-[#3a2a08] shadow-sm",
};

export function Badge({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs tracking-wide ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
