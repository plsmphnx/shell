import { bind, Binding } from 'astal';
import { Gtk } from 'astal/gtk3';
import Hyprland from 'gi://AstalHyprland';

import { join } from '../sub';
import { Monitor } from '../util';

export interface Props extends Monitor.Props {
    reveal: Binding<boolean>;
    onReveal?: (child: Gtk.Widget) => unknown;
    child?: Gtk.Widget | Binding<Gtk.Widget>;
}
export default ({ monitor, reveal, onReveal, child }: Props) => {
    const unsub =
        onReveal &&
        child &&
        reveal.subscribe(
            child instanceof Binding
                ? r => r && onReveal(child.get())
                : r => r && onReveal(child),
        );
    return (
        <window
            namespace="dropdown"
            gdkmonitor={monitor.g}
            anchor={Anchor.TOP | Anchor.RIGHT}
            layer={Layer.OVERLAY}
            onDestroy={() => unsub?.()}>
            <revealer
                revealChild={join(reveal, bind(Hyprland.get_default(), 'focused_monitor')).as(
                    (o, f) => o && f === monitor.h,
                )}
                transitionType={SLIDE_DOWN}
                transitionDuration={1000}>
                {child}
            </revealer>
        </window>
    );
};
