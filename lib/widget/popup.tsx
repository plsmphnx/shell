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

    const [state, state_] = createState({ win: false, rev: false });
    createEffect(() => state_(({ win, rev }) => ({ win: show() || rev, rev: show() && win })));

    return (
        <Window
            kind="popup"
            layer={Layer.OVERLAY}
            defaultHeight={-1}
            defaultWidth={-1}
            {...rest}
            visible={state.as(({ win }) => win)}
            onNotifyVisible={self => self.visible && state_({ win: true, rev: true })}>
            <Workaround>
                <revealer
                    transitionType={transitionType}
                    transitionDuration={transitionDuration}
                    revealChild={state.as(({ rev }) => rev)}
                    onNotifyChildRevealed={self =>
                        self.child_revealed || state_({ win: false, rev: false })
                    }>
                    {children}
                </revealer>
            </Workaround>
        </Window>
    );
};
export type Popup = Window;
