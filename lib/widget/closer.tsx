import { Astal } from 'ags/gtk4';

import { Event, Props } from '../util';

import { Window } from './window';
import { Workaround } from './workaround';

export namespace Closer {
    export type Props = Pick<Props.Window, 'visible' | '$close'>;
}
export const Closer = ({ visible, $close }: Closer.Props) => (
    <Window
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT | Anchor.BOTTOM}
        layer={Layer.TOP}
        keymode={Keymode.NONE}
        visible={visible}>
        <Event.Click $any={evt => $close(evt.widget as Astal.Window)} />
        <Workaround />
    </Window>
);
export type Closer = Window;
