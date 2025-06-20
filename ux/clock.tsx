import { Gtk } from 'ags/gtk4';
import { interval } from 'ags/time';

import GLib from 'gi://GLib';

import { external, listen } from '../lib/sub';
import { Static } from '../lib/util';
import { Toggle } from '../lib/widget';

const TIME = Static(() =>
    external('', set => {
        const time = interval(1000, () =>
            set(GLib.DateTime.new_now_local().format('%I:%M %p')!),
        );
        return () => time.cancel();
    }),
);

export default () => (
    <Toggle id="clock" class="target" label={TIME()}>
        <Gtk.Calendar
            $={self =>
                listen(Toggle.open('clock'), open => {
                    if (open) {
                        const now = GLib.DateTime.new_now_local();
                        self.set_day(1);
                        self.set_year(now.get_year());
                        self.set_month(now.get_month() - 1);
                        self.set_day(now.get_day_of_month());
                    }
                })
            }
        />
    </Toggle>
);
