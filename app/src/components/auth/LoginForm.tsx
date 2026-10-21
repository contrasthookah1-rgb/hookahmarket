"use client";

import { useActionState } from "react";
import { loginCustomer } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm({ otp }: { otp: boolean }) {
  const [state, formAction, pending] = useActionState(loginCustomer, undefined);
  const codeSent = otp && Boolean(state?.sent);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* React resets uncontrolled fields after an action, so the phone is restored via defaultValue. */}
      <Input
        name="phone"
        type="tel"
        label="Номер телефона"
        placeholder="+7 7XX XXX XX XX"
        defaultValue={state?.phone}
        required
        autoFocus={!codeSent}
      />
      {codeSent && (
        <>
          <p className="font-body text-sm text-foreground-muted">Мы отправили код в WhatsApp на этот номер.</p>
          <Input
            name="code"
            label="Код из WhatsApp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            required
            autoFocus
          />
        </>
      )}
      {state?.error && <p className="font-body text-sm text-danger">{state.error}</p>}
      <Button type="submit" variant="primary" loading={pending} disabled={pending}>
        {!otp ? "Войти" : codeSent ? "Войти" : "Получить код"}
      </Button>
      {codeSent && (
        <button
          type="submit"
          name="resend"
          value="1"
          formNoValidate
          disabled={pending}
          className="font-body text-sm text-foreground-muted underline disabled:opacity-50"
        >
          Отправить код ещё раз
        </button>
      )}
    </form>
  );
}
