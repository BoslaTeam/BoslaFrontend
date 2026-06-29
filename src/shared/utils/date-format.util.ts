export function formatAvailabilityDate(date: Date): string {
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatAvailabilityTime(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}
