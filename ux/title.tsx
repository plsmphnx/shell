import { createBinding } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { Monitor, Static } from '../lib/util';
import { Status } from '../lib/widget';

const TITLE = Static(() =>
    createBinding(Hyprland.get_default(), 'focused_client', 'title').as(t => t || ''),
);

const MONITOR = Static(() =>
    createBinding(Hyprland.get_default(), 'focused_client', 'monitor'),
);

export default () => (
    <Status
        id="title"
        class="target"
        visible={Monitor.is(MONITOR())}
        label={TITLE()}
        ellipsize={Ellipsize.END}
    />
);
