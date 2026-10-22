import { LoginForm } from "@/components/auth/LoginForm";
import { otpEnabled } from "@/lib/otp";

// Two panes: a dark brand panel (what the account is for) and the form. On phones the
// panel collapses to a short header so the form stays above the fold.
export default function LoginPage() {
  const otp = otpEnabled();
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <aside className="flex flex-col justify-end bg-surface-inverse px-5 py-10 sm:px-10 lg:py-16">
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto lg:pr-6">
          <h1 className="rise font-display text-4xl leading-tight text-foreground-on-dark sm:text-5xl">
            Ваши заказы — в одном месте
          </h1>
          <p
            className="rise mt-4 max-w-sm font-body text-base text-foreground-on-dark-muted"
            style={{ ["--rise-delay" as string]: "120ms" }}
          >
            История покупок и статус текущих заказов. Пароль не нужен.
          </p>
        </div>
      </aside>

      <main className="flex items-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:mr-auto lg:pl-6">
          <h2 className="font-display text-2xl text-foreground">Войти</h2>
          <p className="mt-2 mb-6 font-body text-sm text-foreground-secondary">
            {otp
              ? "Введите номер телефона — пришлём код в WhatsApp."
              : "Введите номер телефона, и вы сразу попадёте в кабинет."}
          </p>
          <LoginForm otp={otp} />
        </div>
      </main>
    </div>
  );
}
