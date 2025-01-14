import { execAsync } from 'astal';
import { Gdk, Gtk } from 'astal/gtk4';

export type Callback<T extends Gtk.Widget, E> = (obj: T, evt: E) => unknown;
export type Handler<T extends Gtk.Widget, E> = Callback<T, E> | string;

function cb<T extends Gtk.Widget, E>(h?: Handler<T, E>): Callback<T, E> {
    return typeof h === 'string' ? () => execAsync(h) : h || (() => {});
}

export function click<T extends Gtk.Widget>(
    primary?: Handler<T, Gdk.ButtonEvent>,
    secondary?: Handler<T, Gdk.ButtonEvent>,
) {
    primary = cb(primary);
    secondary = cb(secondary);
    return {
        onButtonPressed: (obj: T, evt: Gdk.ButtonEvent): unknown => {
            switch (evt.get_button()) {
                case 1:
                    return primary(obj, evt);
                case 3:
                    return secondary(obj, evt);
            }
        },
    };
}

export function key<T extends Gtk.Widget>(keys: { [key: string]: Handler<T, void> }) {
    const cbs: { [key: number]: Callback<T, void> } = {};
    for (const [k, v] of Object.entries(keys)) {
        cbs[Gdk.keyval_from_name(k)] = cb(v);
    }
    return {
        onKeyPressed: (obj: T, keyval: number): unknown => cbs[keyval]?.(obj),
    };
}
