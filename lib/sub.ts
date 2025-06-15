import {
    Accessor,
    createBinding as bind,
    createComputed as compute,
    createExternal as external,
    createState as state,
    onCleanup,
    Setter,
} from 'ags';
import * as GObject from 'ags/gobject';
import { timeout } from 'ags/time';

export { bind, external, compute, state };

export function after(ms: number, cb: () => void) {
    const [up, up_] = state<{ cb: () => void } | void>({ cb });
    const down = () => up_(u => u?.cb());
    const time = timeout(ms, down);
    onCleanup(() => (time.cancel(), down()));
    return up(u => !!u);
}

export function lazy<T>(val: T) {
    return val instanceof Accessor
        ? (external(val.get(), set => val.subscribe(() => set(val.get()))) as T)
        : val;
}

export function listen<T>(val: Accessor<T> | T, cb: (v: T) => unknown) {
    if (val instanceof Accessor) {
        onCleanup(val.subscribe(() => cb(val.get())));
        cb(val.get());
    } else {
        cb(val);
    }
}

export function observe<T, O extends GObject.Object>(
    init: T,
    obj: O,
    signals: { [s: string]: (...args: any[]) => T },
) {
    return external(init, set => {
        const dispose = Object.entries(signals).map(([signal, handle]) =>
            obj.connect(signal, (_, ...args) => set(handle(...args))),
        );
        return () => dispose.forEach(n => obj.disconnect(n));
    });
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

export function watch<O extends GObject.Object, T>(
    obj: O,
    keys: readonly Extract<keyof O, string>[],
    cb: (o: O) => T,
) {
    const up = () => cb(obj);
    return observe(up(), obj, Object.fromEntries(keys.map(k => [notify(k), up])));
}
