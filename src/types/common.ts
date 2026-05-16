export type Brand<TValue, TBrand extends string> = TValue & {
  readonly __brand: TBrand;
};

export type EntityId<TName extends string> = Brand<string, TName>;
export type ISODateString = string;
export type CurrencyCode = "VND";
export type UserId = EntityId<"UserId">;
