import { execAsync } from 'ags/process';

import Hyprland from 'gi://AstalHyprland';

import { bind, reduce } from '../lib/sub';
import { Event, Monitor, Static } from '../lib/util';

function focused<K extends keyof Hyprland.Client>(key: Extract<K, string>) {
    return reduce(bind(Hyprland.get_default(), 'focused_client')(f => f && bind(f, key)));
}

const TITLE = Static(() => focused('title')(t => t || ''));

const MONITOR = Static(() => focused('monitor'));

export default () => (
    <label
        class="target"
        visible={Monitor.is(MONITOR())}
        label={TITLE()}
        ellipsize={Ellipsize.END}>
        <Event.Click
            $left={() => execAsync('hyprjump movetoworkspace free')}
            $right={() => Hyprland.get_default().dispatch('killactive', '')}
        />
    </label>
);
