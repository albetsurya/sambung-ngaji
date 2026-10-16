export const PIPE_ROUTE = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9];
// Arah: atas, kanan, bawah, kiri. Sumber masuk dari kiri, keluar ke kanan.
const direction = (from: number, to: number) => to === from - 4 ? 0 : to === from + 1 ? 1 : to === from + 4 ? 2 : 3;
export const PIPE_CONNECTIONS = PIPE_ROUTE.map((cell, index) => [
  index === 0 ? 3 : direction(cell, PIPE_ROUTE[index - 1]),
  index === PIPE_ROUTE.length - 1 ? 1 : direction(cell, PIPE_ROUTE[index + 1]),
]);
export function connectedSteps(rotations: number[]): number {
  let count = 0;
  for (let index = 0; index < PIPE_ROUTE.length; index++) {
    const expected = PIPE_CONNECTIONS[index];
    const ports = expected.map((port) => (port + rotations[index]) % 4);
    if (!expected.every((port) => ports.includes(port))) break;
    count++;
  }
  return count;
}
