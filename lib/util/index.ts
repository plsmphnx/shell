export * as Config from './config';
export * as Event from './event';
export * as Icon from './icon';
export * as Monitor from './monitor';
export * as Props from './props';
export { Static } from './static';

export type Select<T, U> = {
    [P in keyof T as T[P] extends U | undefined ? P : never]: T[P];
};
