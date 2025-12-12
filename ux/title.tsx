import { createBinding } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { Monitor, Static } from '../lib/util';
import { Status } from '../lib/widget';

function focused<K extends keyof Hyprland.Client>(
    key: Exclude<Extract<K, string>, '$signals'>,
) {
    return createBinding(Hyprland.get_default(), 'focused_client', key);
}

const TITLE = Static(() => focused('title').as(t => t || ''));

const MONITOR = Static(() => focused('monitor'));

export default () => (
    <Status
        id="title"
        class="target"
        visible={Monitor.is(MONITOR())}
        label={TITLE()}
        ellipsize={Ellipsize.END}
    />
);
