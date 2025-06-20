import {
    Accessor,
    createBinding as bind,
    createComputed as compute,
    createConnection as connect,
    createExternal as external,
    createState as state,
    onCleanup,
    Setter,
} from 'ags';
import * as GObject from 'ags/gobject';
import { Time, timeout } from 'ags/time';

export { bind, compute, connect, external, state };

export function filter<T>(ary: T[], fn: (v: T) => Accessor<boolean>) {
    return compute(ary.map(fn), (...f) => ary.filter((_, i) => f[i]));
}

export function lazy<T>(val: T) {
    return val instanceof Accessor
        ? (external(val.get(), set => val.subscribe(() => set(val.get()))) as T)
        : val;
}

export function listen<T>(val: Accessor<T> | T, cb: (v: T) => void) {
    if (val instanceof Accessor) {
        onCleanup(val.subscribe(() => cb(val.get())));
        cb(val.get());
    } else {
        cb(val);
    }
}

export function popup() {
    const [time, time_] = state<Time | undefined>(undefined);
    onCleanup(() => time_(t => (t?.cancel(), undefined)));
    return [
        time.as(t => !!t),
        (ms: number) => time_(t => (t?.cancel(), timeout(ms, () => time_(undefined)))),
    ] as const;
}

export type Reduced<T> = T extends Accessor<infer I> ? Reduced<I> : T;

function get<T>(val: T): Reduced<T> {
    return val instanceof Accessor ? get(val.get()) : (val as Reduced<T>);
}

function sub<T>(val: T, set: Setter<Reduced<T>>): () => void {
    if (val instanceof Accessor) {
        let next = sub(val.get(), set);
        const un = val.subscribe(() => (next(), (next = sub(val.get(), set))));
        return () => (un(), next());
    }
    set(val as Reduced<T>);
    return () => {};
}

export function reduce<T>(val: T) {
    return external(get(val), set => sub(val, set));
}

function notify(key: string) {
    return `notify::${key
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replaceAll('_', '-')
        .toLowerCase()}`;
}

export function watch<O extends GObject.Object, K extends Extract<keyof O, string>, T>(
    obj: O,
    keys: readonly K[],
    cb: (o: Pick<O, K>) => T,
): Accessor<T> {
    const up = () => cb(obj);
    return (connect as any)(up(), ...keys.map(k => [obj, notify(k), up]));
}
