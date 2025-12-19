import { Accessor, createBinding, createEffect, createMemo, createState } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { Props, Monitor } from '../util';

import { Window } from './window';
import { Workaround } from './workaround';

export namespace Popup {
    export type Props = Omit<Props.Window, 'visible'> &
        Pick<Props.Revealer, 'transitionType' | 'transitionDuration'> & {
            visible: Accessor<boolean>;
        };
}
export const Popup = ({
    visible,
    transitionType,
    transitionDuration,
    children,
    ...rest
}: Popup.Props) => {
    const focused = Monitor.is(createBinding(Hyprland.get_default(), 'focused_monitor'));
    const show = createMemo(() => visible() && focused());

    const [state, state_] = createState([show.peek(), false]);
    createEffect(() => state_(s => [show() || s[1], show() && s[0]]));

    return (
        <Window
            layer={Layer.OVERLAY}
            defaultHeight={-1}
            defaultWidth={-1}
            {...rest}
            visible={state.as(s => s[0])}
            onNotifyVisible={self => self.visible && state_([true, true])}>
            <Workaround>
                <revealer
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                    revealChild={state.as(s => s[1])}
                    onNotifyChildRevealed={self =>
                        self.child_revealed || state_([false, false])
                    }>
                    {children}
                </revealer>
            </Workaround>
        </Window>
    );
};
export type Popup = Window;
