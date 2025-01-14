import { Binding } from 'astal';
import { Gdk, Gtk, Widget } from 'astal/gtk4';

import { Event } from '../util';

export interface Props extends Omit<Widget.ButtonProps, 'child'> {
    reveal?: Binding<boolean>;
    onPrimary?: ((obj: Gtk.Button, evt: Gdk.ButtonEvent) => unknown) | string;
    onSecondary?: ((obj: Gtk.Button, evt: Gdk.ButtonEvent) => unknown) | string;
}

export default ({ reveal, onPrimary, onSecondary, ...rest }: Props) =>
    reveal ? (
        <revealer revealChild={reveal} transitionType={Transition.SLIDE_LEFT} transitionDuration={500}>
            <button {...rest} {...Event.click(onPrimary, onSecondary)} />
        </revealer>
    ) : (
        <button {...rest} {...Event.click(onPrimary, onSecondary)} />
    );
