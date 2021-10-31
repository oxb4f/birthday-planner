export type Mutable<T> = {
  -readonly [Prop in keyof T]: T[Prop];
};
