export function toUTC(date: string, tz: string): string {
  return new Date(date).toISOString();
}
