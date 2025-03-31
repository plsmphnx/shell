import { bind } from 'astal';
import Bluetooth from 'gi://AstalBluetooth';

import { utils } from '../lib/config';
import { join } from '../lib/sub';
import { Context } from '../lib/util';
import { Status } from '../lib/widget';

const ICONS = {
    Off: '\u{f00b2}',
    On: '\u{f00af}',
    Connected: '\u{f00b1}',
};

const ICON = Context(() => {
    const bluetooth = Bluetooth.get_default();
    return join(bind(bluetooth, 'is_powered'), bind(bluetooth, 'is_connected')).as((p, c) =>
        p ? (c ? ICONS.Connected : ICONS.On) : ICONS.Off,
    );
});

export default ({ ctx }: Context.Props) => (
    <Status label={ICON(ctx)} {...utils(ctx, 'bluetooth')} />
);
