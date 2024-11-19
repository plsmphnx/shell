import { bind } from 'astal';
import Bluetooth from 'gi://AstalBluetooth';

import { join } from '../lib/sub';
import { Status } from '../lib/widget';

const ICONS = {
    Off: '\u{f00b2}',
    On: '\u{f00af}',
    Connected: '\u{f00b1}',
};

const bluetooth = Bluetooth.get_default();

const icon = join(bind(bluetooth, 'is_powered'), bind(bluetooth, 'is_connected')).as((p, c) =>
    p ? (c ? ICONS.Connected : ICONS.On) : ICONS.Off,
);

export default () => <Status label={icon} onPrimary="blueberry" />;
