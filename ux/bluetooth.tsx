import Bluetooth from 'gi://AstalBluetooth';

import { watch } from '../lib/sub';
import { Static } from '../lib/util';
import { Status } from '../lib/widget';

const ICONS = {
    Off: '\u{f00b2}',
    On: '\u{f00af}',
    Connected: '\u{f00b1}',
};

const ICON = Static(() =>
    watch(Bluetooth.get_default(), ['is_powered', 'is_connected'], bt =>
        bt.is_powered ? (bt.is_connected ? ICONS.Connected : ICONS.On) : ICONS.Off,
    ),
);

export default () => <Status id="bluetooth" label={ICON()} />;
