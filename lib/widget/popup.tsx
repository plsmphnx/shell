import { onCleanup } from 'ags';
import { Astal, Gtk } from 'ags/gtk4';

import { lazy, listen } from '../sub';
import { Monitor, Props } from '../util';

import { Workaround } from './workaround';

export namespace Popup {
    export type Props = Props.Window &
        Pick<Props.Revealer, 'transitionType' | 'transitionDuration'>;
}
export const Popup = ({
    visible,
    transitionType,
    transitionDuration,
    $$visible,
    children,
    ...rest
}: Popup.Props) => {
    let win: Astal.Window;
    let rev: Gtk.Revealer;
    return (
        <window
            {...Monitor.window()}
            layer={Layer.OVERLAY}
            $={self => {
                win = self;
                listen(lazy(visible) ?? false, v => {
                    rev.reveal_child = rev.child_revealed && v;
                    win.visible = win.visible || v;
                });
                onCleanup(() => self.run_dispose());
            }}
            $$visible={self => ((rev.reveal_child = self.visible), $$visible?.(self))}
            {...rest}>
            <Workaround>
                <revealer
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                    $={self => (rev = self)}
                    $$childRevealed={self => (win.visible = self.child_revealed)}>
                    {children}
                </revealer>
            </Workaround>
        </window>
    );
};
