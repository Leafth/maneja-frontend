export function formatAnimalCount(count: number): string {
  return `${count} ${count === 1 ? 'animal' : 'animais'}`;
}
