"use server";

import { redirect } from "next/navigation";
import { clearCustomerSession, createCustomerSession } from "@/lib/customer-auth";
import { otpEnabled, requestOtp, verifyOtp } from "@/lib/otp";

// `phone` refills the field (React resets forms after an action); `sent` = code is out, show the code field.
export type LoginState = { error?: string; phone?: string; sent?: boolean };

export async function loginCustomer(_prev: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (phone.length < 6) return { error: "Введите номер телефона" };

  if (otpEnabled()) {
    const code = String(formData.get("code") ?? "").trim();
    // No code (first submit) or explicit "resend" → send a new code.
    if (!code || formData.get("resend")) {
      const { error } = await requestOtp(phone);
      return error ? { error, phone, sent: Boolean(formData.get("resend")) } : { phone, sent: true };
    }
    const { error } = await verifyOtp(phone, code);
    if (error) return { error, phone, sent: true };
  }

  await createCustomerSession(phone);
  redirect("/account");
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
