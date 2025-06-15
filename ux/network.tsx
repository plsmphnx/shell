import Network from 'gi://AstalNetwork';

import { bind, compute } from '../lib/sub';
import { Config, Icon, Static } from '../lib/util';
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
    return compute(
        [
            bind(network, 'primary'),
            bind(network.wifi, 'enabled'),
            bind(network.wifi, 'strength'),
        ],
        (primary, enabled, strength) => {
            switch (primary) {
                case WIFI:
                    return enabled ? ICONS.Wifi.On(strength / 100) : ICONS.Wifi.Off;
                case WIRED:
                    return ICONS.Wired;
                default:
                    return ICONS.Off;
            }
        },
    );
});

export default () => <Status label={ICON()} {...Config.utils('network')} />;
