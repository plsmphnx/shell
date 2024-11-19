import Binding, { Subscribable } from 'astal/binding';

export class Reduce<T> implements Subscribable<T> {
    #subs: Subscribable<Binding<T> | T>;

    static reduce<T>(subs: Subscribable<Binding<T> | T>) {
        return new Reduce(subs);
    }

    private constructor(subs: Subscribable<Binding<T> | T>) {
        this.#subs = subs;
    }

    get() {
        const sub = this.#subs.get();
        return sub instanceof Binding ? sub.get() : sub;
    }

    subscribe(cb: (v: T) => void) {
        const sub = this.#subs.get();
        let unsub = sub instanceof Binding ? sub.subscribe(cb) : undefined;
        const unsubs = this.#subs.subscribe(sub => {
            unsub?.();
            if (sub instanceof Binding) {
                cb(sub.get());
                unsub = sub.subscribe(cb);
            } else {
                cb(sub);
                unsub = undefined;
            }
        });
        return () => {
            unsubs();
            unsub?.();
        };
    }
}

export const { reduce } = Reduce;

export class Join<
    const Subs extends Subscribable<any>[],
    const Args extends {
        [K in keyof Subs]: Subs[K] extends Subscribable<infer T> ? T : never;
    },
> implements Subscribable<Args>
{
    #subs: Subs;

    static join<const Subs extends Subscribable<any>[]>(...subs: Subs) {
        return new Join(subs);
    }

    private constructor(subs: Subs) {
        this.#subs = subs;
    }

    get() {
        return this.#subs.map(s => s.get()) as Args;
    }

    subscribe(cb: (v: Args) => void) {
        const us = this.#subs.map(s => s.subscribe(() => cb(this.get())));
        return () => {
            for (const u of us) u();
        };
    }

    as<T>(fn: (...v: Args) => T): Binding<T> {
        return Binding.bind(this).as(args => fn(...args));
    }
}

export const { join } = Join;
