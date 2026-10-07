export function parseDateValue(value) {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === "string" && value.includes("T") ? value : `${value}T12:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateKey(date) {
  const parsed =
    date instanceof Date
      ? date
      : new Date(typeof date === "string" && date.includes("T") ? date : `${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("de", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export const today = toDateKey(new Date());
export const tomorrow = toDateKey(new Date(Date.now() + 86400000));
