import { Accessor, createBinding, createEffect, createMemo } from 'ags';
import { Gtk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

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
    const focused = Monitor.is(createBinding(Hyprland.get_default(), 'focused_monitor'));
    const reveal =
        visible instanceof Accessor
            ? createMemo(() => visible() && focused())
            : visible && focused;
    return (
        <Window
            layer={Layer.OVERLAY}
            $={self => {
                win = self;
                reveal &&
                    createEffect(() => {
                        rev.reveal_child = reveal() && rev.child_revealed;
                        win.visible = reveal() || win.visible;
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
