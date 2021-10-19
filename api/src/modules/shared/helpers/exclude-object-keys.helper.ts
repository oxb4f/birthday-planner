export function excludeKeys<T extends object = {}>(keys: Array<keyof T>, object: T): Partial<T> {
  return (keys as any).reduce((excludedPart: Partial<T>, key: keyof T) => {
    const { [key]: excluded, ...rest } = excludedPart;

    return rest;
  }, object);
}
