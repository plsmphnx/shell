import { createEffect, createState } from 'ags';
import { Gtk } from 'ags/gtk4';
import { createPoll } from 'ags/time';

import GLib from 'gi://GLib';

import { Static } from '../lib/util';
import { Toggle } from '../lib/widget';

const TIME = Static(() =>
    createPoll('', 1000, () => GLib.DateTime.new_now_local().format('%I:%M %p')!),
);

const [DATE, DATE_] = createState(GLib.DateTime.new_now_local());

const ACTIVATE = Static(() => {
    const open = Toggle.open('clock');
    createEffect(() => open() && DATE_(GLib.DateTime.new_now_local()));
});

export default () => (
    <Toggle id="clock" class="target" label={TIME()} $={ACTIVATE}>
        <Gtk.Calendar date={DATE} onNotifyDate={self => DATE_(self.date)} />
    </Toggle>
);
