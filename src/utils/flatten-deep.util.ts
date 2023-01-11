export type NestedArray<T> = Array<NestedArray<T> | T>;

function flatten<T>(arr: T[][]): T[] {
  return ([] as T[]).concat(...arr);
}

export function flattenDeep<T>(input: NestedArray<T>): T[] {
  return flatten(input.map((x) => (Array.isArray(x) ? flattenDeep(x) : [x])));
}
