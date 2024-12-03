import { Binding } from 'astal';

import { Monitor } from '../util';

export interface Props extends Partial<Monitor.Props> {
    reveal?: boolean | Binding<boolean>;
    onClose: () => unknown;
}
export default ({ reveal, monitor, onClose }: Props) => (
    <window
        namespace="closer"
        {...Monitor.gdk(monitor)}
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT | Anchor.BOTTOM}
        layer={Layer.TOP}
        keymode={Keymode.NONE}
        visible={reveal ?? true}>
        <eventbox hexpand vexpand onClick={onClose} />
    </window>
);
