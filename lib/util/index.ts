import { createState, onCleanup } from 'ags';
import { Timer, timeout } from 'ags/time';

export * as Border from './border';
export * as Config from './config';
export * as Icon from './icon';
export * as Monitor from './monitor';
export * as Props from './props';
export * as Utils from './utils';

export { Static } from './static';

export type Select<T, U> = {
    [P in keyof T as T[P] extends U | undefined ? P : never]: T[P];
};

export function time(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec / 60) % 60;
    const s = Math.floor(sec % 60);
    return `${h > 0 ? `${h}:` : ''}${h > 0 ? `0${m}`.slice(-2) : m}:${`0${s}`.slice(-2)}`;
}

export function popup() {
    const [time, time_] = createState<Timer | undefined>(undefined);
    onCleanup(() => time_(t => (t?.cancel(), undefined)));
    return [
        time.as(t => !!t),
        (ms: number) => time_(t => (t?.cancel(), timeout(ms, () => time_(undefined)))),
    ] as const;
}
