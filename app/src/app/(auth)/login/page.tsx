import { LoginForm } from "@/components/auth/LoginForm";
import { Container } from "@/components/ui/Container";
import { otpEnabled } from "@/lib/otp";

export default function LoginPage() {
  const otp = otpEnabled();
  return (
    <Container className="flex max-w-sm flex-col gap-5 py-20">
      <h1 className="font-display text-2xl text-foreground">Личный кабинет</h1>
      <p className="font-body text-sm text-foreground-muted">
        {otp
          ? "Введите номер телефона — мы отправим код подтверждения в WhatsApp."
          : "Код подтверждения временно не требуется — вход выполняется сразу по номеру телефона."}
      </p>
      <LoginForm otp={otp} />
    </Container>
  );
}
