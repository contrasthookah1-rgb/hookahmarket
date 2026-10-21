import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { hasDatabase, prisma } from "./db";
import { normalizePhone } from "./phone";
import { sendOtpCode } from "./whatsapp";

// Login OTP over WhatsApp. OTP_CHANNEL=whatsapp turns it on; anything else (or unset)
// keeps the old behaviour — login succeeds right after the phone is entered.

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

export const otpEnabled = (): boolean => process.env.OTP_CHANNEL === "whatsapp";

// HMAC (not plain hash): a 6-digit code is trivially brute-forced from a leaked hash without the secret.
function hashCode(phone: string, code: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "").update(`${phone}:${code}`).digest("hex");
}

export async function requestOtp(rawPhone: string): Promise<{ error?: string }> {
  if (!hasDatabase) return { error: "Вход по коду временно недоступен" };
  const phone = normalizePhone(rawPhone);
  const now = Date.now();

  await prisma.otpCode.deleteMany({ where: { createdAt: { lt: new Date(now - 60 * 60 * 1000) } } });
  const recent = await prisma.otpCode.findMany({
    where: { phone, createdAt: { gt: new Date(now - 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { error: "Код уже отправлен. Повторно можно запросить через минуту." };
  }
  if (recent.length >= MAX_SENDS_PER_HOUR) {
    return { error: "Слишком много запросов кода. Попробуйте через час." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const row = await prisma.otpCode.create({
    data: { phone, codeHash: hashCode(phone, code), expiresAt: new Date(now + CODE_TTL_MS) },
  });
  if (!(await sendOtpCode(phone, code))) {
    // Don't leave a row that counts against the customer's hourly limit for a code they never got.
    await prisma.otpCode.delete({ where: { id: row.id } });
    return { error: "Не удалось отправить код в WhatsApp. Проверьте номер и попробуйте ещё раз." };
  }
  return {};
}

export async function verifyOtp(rawPhone: string, code: string): Promise<{ error?: string }> {
  const phone = normalizePhone(rawPhone);
  const row = await prisma.otpCode.findFirst({
    where: { phone, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { error: "Код не найден или истёк. Запросите новый." };
  if (row.attempts >= MAX_ATTEMPTS) return { error: "Слишком много неверных попыток. Запросите новый код." };

  // Count the attempt before comparing, so concurrent guesses can't all slip under the limit.
  await prisma.otpCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });

  const given = Buffer.from(hashCode(phone, code));
  const stored = Buffer.from(row.codeHash);
  if (given.length !== stored.length || !timingSafeEqual(given, stored)) return { error: "Неверный код" };

  await prisma.otpCode.deleteMany({ where: { phone } });
  return {};
}
