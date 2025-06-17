import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import { Event, Props } from '../util';

export namespace Status {
    export type Props = Props.Label & {
        $primary?: (evt: Gtk.GestureClick) => unknown;
        $secondary?: (evt: Gtk.GestureClick) => unknown;
    };
}
export const Status = ({ visible, $primary, $secondary, ...rest }: Status.Props) => {
    const inner = (
        <label {...rest}>
            <Event.Click $left={$primary} $right={$secondary} />
        </label>
    );
    return visible instanceof Accessor ? (
        <revealer
            revealChild={visible}
            transitionType={Transition.SLIDE_LEFT}
            transitionDuration={500}>
            {inner}
        </revealer>
    ) : (
        inner
    );
};
export type Status = Gtk.Widget;
