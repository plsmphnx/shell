import { Context } from './context';
import * as Monitor from './monitor';

export { Context } from './context';
export * as Event from './event';
export * as Monitor from './monitor';
export * as Widget from './widget';

export type Select<T, U> = {
    [P in keyof T as T[P] extends U | undefined ? P : never]: T[P];
};

export interface Props extends Context.Props, Monitor.Props {}
