import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

import { bind, compute, lazy, listen } from '../sub';
import { Props, Monitor } from '../util';

import { Window } from './window';
import { Workaround } from './workaround';

export namespace Popup {
    export type Props = Props.Window &
        Pick<Props.Revealer, 'transitionType' | 'transitionDuration'>;
}
export const Popup = ({
    visible,
    transitionType,
    transitionDuration,
    children,
    ...rest
}: Popup.Props) => {
    let win: Window;
    let rev: Gtk.Revealer;
    const focused = Monitor.is(bind(Hyprland.get_default(), 'focused_monitor'));
    const reveal =
        visible instanceof Accessor
            ? compute([visible, focused], (v, f) => v && f)
            : visible && focused;
    return (
        <Window
            layer={Layer.OVERLAY}
            $={self => {
                win = self;
                listen(lazy(reveal ?? false), r => {
                    rev.reveal_child = rev.child_revealed && r;
                    win.visible = win.visible || r;
                });
            }}
            defaultHeight={-1}
            defaultWidth={-1}
            {...rest}
            onNotifyVisible={self => (rev.reveal_child = self.visible)}>
            <Workaround>
                <revealer
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                    $={self => (rev = self)}
                    onNotifyChildRevealed={self => (win.visible = self.child_revealed)}>
                    {children}
                </revealer>
            </Workaround>
        </Window>
    );
};
export type Popup = Window;
