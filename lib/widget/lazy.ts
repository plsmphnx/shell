import { Variable } from 'astal';
import { Gtk } from 'astal/gtk4';

export default class<K, V> extends Variable<Gtk.Widget[]> {
    #map: Map<K, Gtk.Widget>;
    #fun: (v: V) => readonly [K, Gtk.Widget];

    #set() {
        this.set([...this.#map.entries()].sort().map(([, v]) => v));
    }

    constructor(fun: (v: V) => readonly [K, Gtk.Widget], init: V[] = []) {
        super([]);
        this.#fun = fun;
        this.#map = new Map(init.map(fun));
        this.#set();
    }

    add(v: V) {
        const [k, w] = this.#fun(v);
        const p = this.#map.get(k)
        this.#map.set(k, w);
        this.#set();
        p?.run_dispose()
    }

    del(k: K) {
        const p = this.#map.get(k)
        this.#map.delete(k);
        this.#set();
        p?.run_dispose()
    }
}
