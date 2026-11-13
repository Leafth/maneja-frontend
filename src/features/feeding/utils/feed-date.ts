export function brDateToDateOnly(value: string): string {
  const [day, month, year] = value.split('/');

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function brDateTimeToIso(date: string, time: string): string {
  return new Date(`${brDateToDateOnly(date)}T${time}:00`).toISOString();
}

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
}

export function formatTimeInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1:$2');
}

/** Data local no formato AAAA-MM-DD. */
export function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}
