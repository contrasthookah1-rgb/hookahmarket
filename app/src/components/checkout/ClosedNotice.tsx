"use client";

import { useSyncExternalStore } from "react";

// Orders are handled by the Уалиханова shop (BRANCHES.centre.hours: 11:00–23:00),
// Astana time. Outside those hours say when the order will actually be picked up.
const OPEN_HOUR = 11;
const CLOSE_HOUR = 23;
const hourFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Almaty" });

type Status = "open" | "evening" | "morning";

const getStatus = (): Status => {
  const hour = Number(hourFormat.format(new Date()));
  if (hour >= CLOSE_HOUR) return "evening";
  return hour < OPEN_HOUR ? "morning" : "open";
};

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};

export function ClosedNotice({ className = "" }: { className?: string }) {
  // Server render shows nothing ("open"); the client switches over after hydration.
  const status = useSyncExternalStore(subscribe, getStatus, () => "open" as Status);
  if (status === "open") return null;

  return (
    <p
      role="status"
      className={`rounded-sm border border-gold-strong/30 bg-gold-soft/25 px-3 py-2.5 font-body text-sm text-foreground ${className}`}
    >
      Магазин работает ежедневно с {OPEN_HOUR}:00 до {CLOSE_HOUR}:00.{" "}
      {status === "evening"
        ? "Заказ, оформленный сейчас, мы обработаем завтра."
        : `Заказ, оформленный сейчас, мы обработаем сегодня после ${OPEN_HOUR}:00.`}
    </p>
  );
}
