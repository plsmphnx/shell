import { createRoot, getScope, Scope } from 'ags';

let global: Scope;
const data: { [key: symbol]: any } = {};

export function Static<T>(init: () => T): () => T {
    const sym = Symbol();
    return () => (sym in data ? data[sym] : (data[sym] = global.run(init)));
}

export namespace Static {
    export function init() {
        createRoot(() => (global = getScope()));
    }
}
