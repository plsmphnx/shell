import { Accessor, With } from 'ags';
import * as GObject from 'ags/gobject';
import { Astal, Gtk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

import { bind, compute, lazy, listen, state } from '../sub';
import { Props, Monitor } from '../util';

import { Window } from './window';
import { Workaround } from './workaround';

export namespace Popup {
    export type Props = Omit<Window.Props, 'children' | 'visible'> &
        Pick<Props.Revealer, 'transitionType' | 'transitionDuration'> & {
            visible: Accessor<boolean>;
            children: () => GObject.Object;
        };
}
export const Popup = ({
    visible,
    transitionType,
    transitionDuration,
    children,
    ...rest
}: Popup.Props) => {
    const focused = Monitor.is(bind(Hyprland.get_default(), 'focused_monitor'));
    const reveal = compute([visible, focused], (v, f) => v && f);
    const [open, open_] = state(reveal.get());
    listen(lazy(reveal), r => r && open_(true));
    return (
        <With value={open} cleanup={win => (win as Astal.Window).destroy()}>
            {o => {
                if (!o) {
                    return undefined;
                }

                let rev: Gtk.Revealer;
                return (
                    <Window
                        layer={Layer.OVERLAY}
                        defaultHeight={-1}
                        defaultWidth={-1}
                        {...rest}
                        visible
                        $={() => (rev.reveal_child = true)}>
                        <Workaround>
                            <revealer
                                transitionType={transitionType}
                                transitionDuration={transitionDuration}
                                $={self => {
                                    rev = self;
                                    listen(
                                        lazy(reveal),
                                        r => (self.reveal_child = self.child_revealed && r),
                                    );
                                }}
                                onNotifyChildRevealed={self =>
                                    self.child_revealed || open_(false)
                                }>
                                {children()}
                            </revealer>
                        </Workaround>
                    </Window>
                );
            }}
        </With>
    );
};
export type Popup = Window;
