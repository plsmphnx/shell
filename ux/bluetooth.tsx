import { createBinding, createComputed } from 'ags';

import Bluetooth from 'gi://AstalBluetooth';

import { Static } from '../lib/util';
import { Status } from '../lib/widget';

const ICONS = {
    Off: '\u{f00b2}',
    On: '\u{f00af}',
    Connected: '\u{f00b1}',
};

const ICON = Static(() => {
    const bluetooth = Bluetooth.get_default();
    const powered = createBinding(bluetooth, 'is_powered');
    const connected = createBinding(bluetooth, 'is_connected');
    return createComputed(() =>
        powered() ? (connected() ? ICONS.Connected : ICONS.On) : ICONS.Off,
    );
});

export default () => <Status id="bluetooth" label={ICON()} />;
