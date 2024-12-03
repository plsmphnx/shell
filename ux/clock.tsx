import { Variable } from 'astal';
import { Widget } from 'astal/gtk3';

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
        className="target"
        ctx={ctx}
        monitor={monitor}
        label={TIME(ctx)}
        onReveal={box => {
            const now = new Date();
            const calendar = (box as Widget.Box).child as Calendar;
            calendar.select_day(now.getDate());
            calendar.select_month(now.getMonth(), now.getFullYear());
        }}>
        <box className="calendar">
            <Calendar />
        </box>
    </Toggle>
);
