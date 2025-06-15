import { Fragment } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

export namespace Key {
    export type Props = { [Key in `$${string}`]?: (evt: Gtk.EventControllerKey) => unknown };
}
export const Key = (props: Key.Props) => {
    const cbs = Object.fromEntries(
        Object.entries(props)
            .filter(([, v]) => v)
            .map(([k, v]) => [Gdk.keyval_from_name(k[1].toUpperCase() + k.slice(2)), v]),
    );
    return <Gtk.EventControllerKey $keyPressed={(self, keyval) => cbs[keyval]?.(self)} />;
};

export const BUTTONS = { any: 0, left: 1, right: 3 } as const;

export namespace Click {
    export type Props = {
        [Key in `$${keyof typeof BUTTONS}`]?: (
            evt: Gtk.GestureClick,
            x: number,
            y: number,
        ) => unknown;
    };
}
export const Click = (props: Click.Props) => (
    <Fragment>
        {Object.entries(BUTTONS)
            .map(([k, v]) => [('$' + k) as keyof Click.Props, v] as const)
            .filter(([k]) => k in props)
            .map(([k, v]) => [props[k]!, v] as const)
            .map(([k, v]) => (
                <Gtk.GestureClick button={v} $pressed={(evt, _, x, y) => k(evt, x, y)} />
            ))}
    </Fragment>
);
