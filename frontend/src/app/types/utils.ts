export type ItemOf<U> = U extends (infer T)[]
  ? T
  : U extends ReadonlyArray<infer T>
    ? T
    : never;
