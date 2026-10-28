function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Formata uma data ISO como dd/mm/aaaa (ou dd/mm sem o ano). */
export function formatDate(
  isoDate: string,
  { withYear = true }: { withYear?: boolean } = {},
): string {
  const date = new Date(isoDate);
  const dayMonth = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

  return withYear ? `${dayMonth}/${date.getFullYear()}` : dayMonth;
}

/** Formata um intervalo como "dd/mm — dd/mm/aaaa", repetindo o ano se forem diferentes. */
export function formatDateRange(startIsoDate: string, endIsoDate: string): string {
  const sameYear =
    new Date(startIsoDate).getFullYear() === new Date(endIsoDate).getFullYear();

  return `${formatDate(startIsoDate, { withYear: !sameYear })} — ${formatDate(endIsoDate)}`;
}

/** Formata a hora de uma data ISO como hh:mm. */
export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Texto relativo em dias: "hoje", "há 1 dia", "há N dias". */
export function formatDaysAgo(isoDate: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY_IN_MS),
  );

  if (days === 0) {
    return 'hoje';
  }

  return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
}
