import { Market } from "./types";

export function getObjectBy(
  prop: Record<string, unknown>,
  array: Record<string, unknown>[]
) {
  const [propName] = Object.keys(prop);
  const [propVal] = Object.values(prop);

  const index = array.findIndex((object) => {
    return object[propName] === propVal;
  });
  return { index, object: array[index] };
}
