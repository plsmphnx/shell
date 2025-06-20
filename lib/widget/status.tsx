import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import { Props } from '../util';

import * as Event from './event';

export namespace Status {
    export type Props = Props.Label & {
        onPrimary?: (evt: Gtk.GestureClick) => void;
        onSecondary?: (evt: Gtk.GestureClick) => void;
    };
}
export const Status = ({ visible, onPrimary, onSecondary, ...rest }: Status.Props) => {
    const inner = (
        <label {...rest}>
            <Event.Click onLeft={onPrimary} onRight={onSecondary} />
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
