import { v4 as uuidV4 } from 'uuid';

declare const brand: unique symbol;

type Brand<T, TBrand> = T & { [brand]: TBrand };

export type IDBrand = Brand<string, 'Brand'>;

export type DistributiveOmit<T, K extends PropertyKey> = T extends T ? Omit<T, K> : never;

export const generateID = (): IDBrand => {
    return uuidV4() as IDBrand;
};
