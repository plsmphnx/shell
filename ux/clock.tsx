import { Gtk } from 'ags/gtk4';
import { createPoll } from 'ags/time';

import GLib from 'gi://GLib';

import { Static } from '../lib/util';
import { Toggle } from '../lib/widget';

const TIME = Static(() =>
    createPoll('', 1000, () => GLib.DateTime.new_now_local().format('%I:%M %p')!),
);

export default () => (
    <Toggle id="clock" class="target" label={TIME()}>
        <Gtk.Calendar
            onMap={self => {
                const now = GLib.DateTime.new_now_local();
                self.set_day(1);
                self.set_year(now.get_year());
                self.set_month(now.get_month() - 1);
                self.set_day(now.get_day_of_month());
            }}
        />
    </Toggle>
);
