import { execAsync } from 'astal';
import { Astal, Gdk, Gtk } from 'astal/gtk3';

export type Callback<T extends Gtk.Widget, E> = (obj: T, evt: E) => unknown;
export type Handler<T extends Gtk.Widget, E> = Callback<T, E> | string;

function cb<T extends Gtk.Widget, E>(h?: Handler<T, E>): Callback<T, E> {
    return typeof h === 'string' ? () => execAsync(h) : h || (() => {});
}

export function click<T extends Gtk.Widget>(
    primary?: Handler<T, Astal.ClickEvent>,
    secondary?: Handler<T, Astal.ClickEvent>,
) {
    primary = cb(primary);
    secondary = cb(secondary);
    return {
        onClick: (obj: T, evt: Astal.ClickEvent): unknown => {
            switch (evt.button) {
                case Mouse.PRIMARY:
                    return primary(obj, evt);
                case Mouse.SECONDARY:
                    return secondary(obj, evt);
            }
        },
    };
}

export function key<T extends Gtk.Widget>(keys: { [key: string]: Handler<T, Gdk.Event> }) {
    const cbs: { [key: number]: Callback<T, Gdk.Event> } = {};
    for (const [k, v] of Object.entries(keys)) {
        cbs[Gdk.keyval_from_name(k)] = cb(v);
    }
    return {
        onKeyPressEvent: (obj: T, evt: Gdk.Event): unknown =>
            cbs[evt.get_keyval()[1]]?.(obj, evt),
    };
}
