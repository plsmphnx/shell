import { Fragment } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

export namespace Key {
    export type Props = { [Key in `on${string}`]?: (evt: Gtk.EventControllerKey) => void };
}
export const Key = (props: Key.Props) => {
    const cbs = Object.fromEntries(
        Object.entries(props)
            .filter(([, v]) => v)
            .map(([k, v]) => [Gdk.keyval_from_name(k.slice(2)), v]),
    );
    return <Gtk.EventControllerKey onKeyPressed={(evt, keyval) => cbs[keyval]?.(evt)} />;
};

export const BUTTONS = { Any: 0, Left: 1, Right: 3 } as const;

export namespace Click {
    export type Props = {
        [Key in `on${keyof typeof BUTTONS}`]?: (
            evt: Gtk.GestureClick,
            x: number,
            y: number,
        ) => void;
    };
}
export const Click = (props: Click.Props) => (
    <Fragment>
        {Object.entries(BUTTONS)
            .map(([k, v]) => [('on' + k) as keyof Click.Props, v] as const)
            .filter(([k]) => k in props)
            .map(([k, v]) => [props[k]!, v] as const)
            .map(([k, v]) => (
                <Gtk.GestureClick button={v} onPressed={(evt, _, x, y) => k(evt, x, y)} />
            ))}
    </Fragment>
);

export namespace Hover {
    export type Props = { onHover: (evt: Gtk.EventControllerMotion, hover: boolean) => void };
}
export const Hover = ({ onHover }: Hover.Props) => (
    <Gtk.EventControllerMotion
        onEnter={evt => onHover(evt, true)}
        onLeave={evt => onHover(evt, false)}
    />
);
