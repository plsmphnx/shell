import { Binding } from 'astal';

import { Monitor, opt } from '../util';

export interface Props extends Partial<Monitor.Props> {
    reveal?: boolean | Binding<boolean>;
    onClose: () => unknown;
}
export default ({ reveal, monitor, onClose }: Props) => (
    <window
        namespace="closer"
        {...opt('gdkmonitor', monitor?.g)}
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT | Anchor.BOTTOM}
        layer={Layer.TOP}
        keymode={Keymode.NONE}
        visible={reveal ?? true}>
        <eventbox hexpand vexpand onClick={onClose} />
    </window>
);
