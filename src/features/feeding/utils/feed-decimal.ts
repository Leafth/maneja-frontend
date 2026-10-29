export function decimalStringToScaled(value: string): number {
  const normalized = value.trim().replace(',', '.');

  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Decimal inválido: ${value}`);
  }

  const negative = normalized.startsWith('-');
  const unsigned = negative ? normalized.slice(1) : normalized;

  const [integerPart, decimalPart = ''] = unsigned.split('.');

  const integer = Number(integerPart);
  const decimal = Number(decimalPart.padEnd(2, '0'));

  const scaled = integer * 100 + decimal;

  return negative ? -scaled : scaled;
}

export function scaledToNumber(value: number): number {
  return value / 100;
}

export function scaledToDisplay(value: number): string {
  return (value / 100).toFixed(2).replace('.', ',');
}
