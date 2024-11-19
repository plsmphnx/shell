import { bind } from 'astal';
import Battery from 'gi://AstalBattery';

import { select } from '../lib/icons';
import { join } from '../lib/sub';
import { Monitor } from '../lib/util';
import { Toggle } from '../lib/widget';

const { CHARGING, DISCHARGING, EMPTY, UNKNOWN } = Battery.State;
const { BATTERY } = Battery.Type;

const ICONS = {
    Icon: '\u{f0425}',
    Alert: '\u{f10cd}',
    Commands: {
        Shutdown: '\u{f0425}',
        Restart: '\u{f0709}',
        Logout: '\u{f05fd}',
        Sleep: '\u{f0904}',
        Lock: '\u{f033e}',
    },
    Draining: select(
        '\u{f008e}',
        '\u{f007a}',
        '\u{f007b}',
        '\u{f007c}',
        '\u{f007d}',
        '\u{f007e}',
        '\u{f007f}',
        '\u{f0080}',
        '\u{f0081}',
        '\u{f0082}',
        '\u{f0079}',
    ),
    Charging: select(
        '\u{f089f}',
        '\u{f089c}',
        '\u{f0086}',
        '\u{f0087}',
        '\u{f0088}',
        '\u{f089d}',
        '\u{f0089}',
        '\u{f089e}',
        '\u{f008a}',
        '\u{f008b}',
        '\u{f0085}',
    ),
};

const COMMANDS = {
    Shutdown: 'systemctl poweroff',
    Restart: 'systemctl reboot',
    Logout: 'loginctl lock-session && hyprctl dispatch exit',
    Sleep: 'systemctl suspend-then-hibernate',
    Lock: 'loginctl lock-session',
};

function time(s: number) {
    return new Date(s * 1000).toISOString().substring(14, 19);
}

const battery = Battery.get_default();

const type = bind(battery, 'device_type');
const state = bind(battery, 'state');
const percent = bind(battery, 'percentage');
const empty = bind(battery, 'time_to_empty');
const full = bind(battery, 'time_to_full');

const icon = join(type, state, percent).as((t, s, p) => {
    switch (t === BATTERY ? s : UNKNOWN) {
        case CHARGING:
            return ICONS.Charging(p);
        case DISCHARGING:
            return ICONS.Draining(p);
        case EMPTY:
            return ICONS.Alert;
        default:
            return ICONS.Icon;
    }
});

const tooltip = join(type, state, percent, empty, full).as((t, s, p, e, f) => {
    p = Math.floor(p * 100);
    switch (t === BATTERY ? s : UNKNOWN) {
        case CHARGING:
            return `${p}% (${time(f)})`;
        case DISCHARGING:
            return `${p}% (${time(e)})`;
        case EMPTY:
            return '0%';
        default:
            return '100%';
    }
});

export default ({ monitor }: Monitor.Props) => (
    <Toggle className="status" monitor={monitor} label={icon} tooltipText={tooltip}>
        <box className="menu" vertical>
            {Object.entries(COMMANDS).map(([name, cmd]) => (
                <button
                    label={(ICONS.Commands as any)[name]}
                    css="font-size: 150%"
                    onClicked={cmd}
                />
            ))}
        </box>
    </Toggle>
);
