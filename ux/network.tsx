import { createBinding, createMemo } from 'ags';

import Network from 'gi://AstalNetwork';

import { Icon, Static } from '../lib/util';
import { Status } from '../lib/widget';

const { WIFI, WIRED } = Network.Primary;

const ICONS = {
    Off: '\u{f0164}',
    Wired: '\u{f0200}',
    Wifi: {
        Off: '\u{f092d}',
        On: Icon.select('\u{f092f}', '\u{f091f}', '\u{f0922}', '\u{f0925}', '\u{f0928}'),
    },
};

const ICON = Static(() => {
    const network = Network.get_default();
    const primary = createBinding(network, 'primary');
    const enabled = createBinding(network, 'wifi', 'enabled');
    const strength = createBinding(network, 'wifi', 'strength');
    return createMemo(() => {
        switch (primary()) {
            case WIFI:
                return enabled() ? ICONS.Wifi.On(strength() / 100) : ICONS.Wifi.Off;
            case WIRED:
                return ICONS.Wired;
            default:
                return ICONS.Off;
        }
    });
});

export default () => <Status id="network" label={ICON()} />;
