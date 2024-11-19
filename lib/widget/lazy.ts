import { Variable } from 'astal';
import { Gtk } from 'astal/gtk3';

export default class<K, V> extends Variable<Gtk.Widget[]> {
    #map: Map<K, Gtk.Widget>;
    #fun: (v: V) => readonly [K, Gtk.Widget];

    #del(k: K) {
        this.#map.get(k)?.destroy();
    }

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
        this.#del(k);
        this.#map.set(k, w);
        this.#set();
    }

    del(k: K) {
        this.#del(k);
        this.#map.delete(k);
        this.#set();
    }
}
