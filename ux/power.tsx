import { createBinding, createComputed } from 'ags';
import { exec } from 'ags/process';

import Battery from 'gi://AstalBattery';

import { Icon, Static, time } from '../lib/util';
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
    Draining: Icon.select(
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
    Charging: Icon.select(
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
    Logout: 'hyprctl dispatch exit',
    Sleep: 'systemctl sleep',
    Lock: 'loginctl lock-session',
};

function props() {
    const battery = Battery.get_default();
    const type = createBinding(battery, 'device_type');
    const state = createBinding(battery, 'state');
    return {
        state: createComputed(() => (type() === BATTERY ? state() : UNKNOWN)),
        percent: createBinding(battery, 'percentage'),
        empty: createBinding(battery, 'time_to_empty'),
        full: createBinding(battery, 'time_to_full'),
    };
}

const ICON = Static(() => {
    const battery = props();
    return createComputed(() => {
        switch (battery.state()) {
            case CHARGING:
                return battery.full() > 0 ? ICONS.Charging(battery.percent()) : ICONS.Icon;
            case DISCHARGING:
                return battery.empty() > 0 ? ICONS.Draining(battery.percent()) : ICONS.Alert;
            case EMPTY:
                return ICONS.Alert;
            default:
                return ICONS.Icon;
        }
    });
});

const TOOL = Static(() => {
    const battery = props();
    return createComputed(() => {
        const p = Math.floor(battery.percent() * 100);
        switch (battery.state()) {
            case CHARGING:
                return battery.full() > 0 ? `${p}% (${time(battery.full())})` : `${p}%`;
            case DISCHARGING:
                return battery.empty() > 0 ? `${p}% (${time(battery.empty())})` : `${p}%`;
            case EMPTY:
                return '0%';
            default:
                return '100%';
        }
    });
});

export default () => (
    <Toggle id="power" label={ICON()} tooltipText={TOOL()}>
        <box class="power menu" orientation={Orientation.VERTICAL}>
            {Object.entries(COMMANDS).map(([name, cmd]) => (
                <button label={(ICONS.Commands as any)[name]} onClicked={() => exec(cmd)} />
            ))}
        </box>
    </Toggle>
);
