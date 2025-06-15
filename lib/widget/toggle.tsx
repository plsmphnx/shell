import { Accessor, State } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { bind, compute, listen, state } from '../sub';
import { Monitor, Static } from '../util';

import { Closer } from './closer';
import { Popup } from './popup';
import { Status } from './status';

const OPEN = Static(() => ({} as { [id: string]: State<boolean> }));

export namespace Toggle {
    export type Props = Omit<Status.Props, '$primary'> & {
        id: string;
        drop?: Accessor<boolean>;
    };
}
export const Toggle = ({ id, visible, drop, children, $open, ...rest }: Toggle.Props) => {
    const map = OPEN();
    const [open, open_] = map[id] || (map[id] = state(false));

    const focused = Monitor.is(bind(Hyprland.get_default(), 'focused_monitor'));
    const show = drop
        ? compute([open, drop, focused], (o, d, f) => (o || d) && f)
        : compute([open, focused], (o, f) => o && f);

    const [watch, watch_] = state(open.get());

    <Popup
        visible={show}
        transitionType={Transition.SLIDE_DOWN}
        transitionDuration={1000}
        anchor={Anchor.TOP | Anchor.RIGHT}
        $={self => $open! && listen(bind(self, 'visible'), o => watch_(o))}>
        {children}
    </Popup>;

    <Closer visible={open} $close={() => open_(false)} />;

    return (
        <Status
            $primary={() => open_(o => !o)}
            visible={visible}
            $={self => {
                listen(visible, v => v || open_(false));
                if ($open!) {
                    listen(watch, w => $open(self, w));
                    listen(open, o => watch_(o || !drop?.get()));
                }
            }}
            {...rest}
        />
    );
};
