import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import { Props, Utils } from '../util';

import * as Event from './event';

export namespace Status {
    export type Props = Props.Label & {
        id: string;
        reveal?: Accessor<boolean>;
        onPrimary?: (evt: Gtk.GestureClick) => void;
        onSecondary?: (evt: Gtk.GestureClick) => void;
    };
}
export const Status = ({ id, reveal, onPrimary, onSecondary, ...rest }: Status.Props) => {
    const inner = (
        <label {...rest}>
            <Event.Click
                onLeft={onPrimary || (() => Utils.run(id, 0))}
                onRight={onSecondary || (() => Utils.run(id, 1))}
            />
        </label>
    );
    return reveal ? (
        <revealer
            revealChild={reveal}
            transitionType={Transition.SLIDE_LEFT}
            transitionDuration={500}>
            {inner}
        </revealer>
    ) : (
        inner
    );
};
export type Status = Gtk.Widget;
