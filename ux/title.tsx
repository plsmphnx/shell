import { execAsync } from 'ags/process';

import Hyprland from 'gi://AstalHyprland';

import { bind, reduce } from '../lib/sub';
import { Monitor, Static } from '../lib/util';
import { Event } from '../lib/widget';

function focused<K extends keyof Hyprland.Client>(key: Extract<K, string>) {
    return reduce(bind(Hyprland.get_default(), 'focused_client').as(f => f && bind(f, key)));
}

const TITLE = Static(() => focused('title').as(t => t || ''));

const MONITOR = Static(() => focused('monitor'));

export default () => (
    <label
        class="target"
        visible={Monitor.is(MONITOR())}
        label={TITLE()}
        ellipsize={Ellipsize.END}>
        <Event.Click
            onLeft={() => execAsync('hyprjump movetoworkspace free')}
            onRight={() => Hyprland.get_default().dispatch('killactive', '')}
        />
    </label>
);
