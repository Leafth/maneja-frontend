export function brDateToDateOnly(value: string): string {
  const [day, month, year] = value.split('/');

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
