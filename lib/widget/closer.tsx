import { onCleanup } from 'ags';
import { Astal } from 'ags/gtk4';

import { Event, Monitor, Props } from '../util';

import { Workaround } from './workaround';

export namespace Closer {
    export type Props = Pick<Props.Window, 'visible' | '$close'>;
}
export const Closer = ({ visible, $close }: Closer.Props) => (
    <window
        {...Monitor.window()}
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT | Anchor.BOTTOM}
        layer={Layer.TOP}
        keymode={Keymode.NONE}
        visible={visible}
        $={self => onCleanup(() => self.run_dispose())}>
        <Event.Click $any={evt => $close(evt.widget as Astal.Window)} />
        <Workaround />
    </window>
);
