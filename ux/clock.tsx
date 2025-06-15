import { Gtk } from 'ags/gtk4';
import { interval } from 'ags/time';

import { external } from '../lib/sub';
import { Static } from '../lib/util';
import { Toggle } from '../lib/widget';

const TIME = Static(() =>
    external('', set => {
        const time = interval(1000, () =>
            set(new Date().toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })),
        );
        return () => time.cancel();
    }),
);

export default () => {
    const calendar = new Gtk.Calendar();
    return (
        <Toggle
            id="clock"
            class="target"
            label={TIME()}
            $open={() => {
                const now = new Date();
                calendar.set_year(now.getFullYear());
                calendar.set_month(now.getMonth());
                calendar.set_day(now.getDate());
            }}>
            {calendar}
        </Toggle>
    );
};
