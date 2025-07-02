export * as Config from './config';
export * as Icon from './icon';
export * as Monitor from './monitor';
export * as Props from './props';
export * as Utils from './utils';

export type Select<T, U> = {
    [P in keyof T as T[P] extends U | undefined ? P : never]: T[P];
};

export function Static<T>(init: () => T): () => T {
    const sym = Symbol();
    return () => (sym in Static ? (Static as any)[sym] : ((Static as any)[sym] = init()));
}

export function time(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec / 60) % 60;
    const s = Math.floor(sec % 60);
    return `${h > 0 ? `${h}:` : ''}${h > 0 ? `0${m}`.slice(-2) : m}:${`0${s}`.slice(-2)}`;
}
