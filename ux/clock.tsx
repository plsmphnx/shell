import { Variable } from 'astal';
import { Gtk } from 'astal/gtk4';

import { Context, Props } from '../lib/util';
import { Calendar, Toggle } from '../lib/widget';

const TIME = Context(() =>
    Variable('').poll(1000, () =>
        new Date().toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        }),
    )(),
);

export default ({ ctx, monitor }: Props) => (
    <Toggle
        id="clock"
        cssClasses={['target']}
        ctx={ctx}
        monitor={monitor}
        label={TIME(ctx)}
        onReveal={box => {
            const now = new Date();
            const calendar = (box as Gtk.Box).get_first_child() as Gtk.Calendar;
            calendar.set_year(now.getFullYear())
            calendar.set_month(now.getMonth())
            calendar.set_day(now.getDate());
        }}>
        <box cssClasses={['calendar']}>
            <Calendar />
        </box>
    </Toggle>
);
