import { Gtk } from 'ags/gtk4';

import GLib from 'gi://GLib';

import { poll } from '../lib/sub';
import { Static } from '../lib/util';
import { Toggle } from '../lib/widget';

const TIME = Static(() =>
    poll('', 1000, () => GLib.DateTime.new_now_local().format('%I:%M %p')!),
);

export default () => (
    <Toggle id="clock" class="target" label={TIME()}>
        {() => <Gtk.Calendar />}
    </Toggle>
);
