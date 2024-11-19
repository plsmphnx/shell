import { bind } from 'astal';
import Network from 'gi://AstalNetwork';

import { select } from '../lib/icons';
import { join } from '../lib/sub';
import { Status } from '../lib/widget';

const { WIFI, WIRED } = Network.Primary;

const ICONS = {
    Off: '\u{f0164}',
    Wired: '\u{f0200}',
    Wifi: {
        Off: '\u{f092d}',
        On: select('\u{f092f}', '\u{f091f}', '\u{f0922}', '\u{f0925}', '\u{f0928}'),
    },
};

const network = Network.get_default();

const icon = join(
    bind(network, 'primary'),
    bind(network.wifi, 'enabled'),
    bind(network.wifi, 'strength'),
).as((primary, enabled, strength) => {
    switch (primary) {
        case WIFI:
            return enabled ? ICONS.Wifi.On(strength / 100) : ICONS.Wifi.Off;
        case WIRED:
            return ICONS.Wired;
        default:
            return ICONS.Off;
    }
});

export default () => (
    <Status label={icon} onPrimary="iwgtk" onSecondary="nm-connection-editor" />
);
