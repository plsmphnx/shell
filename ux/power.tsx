import { exec } from 'ags/process';

import Battery from 'gi://AstalBattery';

import { watch } from '../lib/sub';
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

function state({ device_type, state }: Pick<Battery.Device, 'device_type' | 'state'>) {
    return device_type === BATTERY ? state : UNKNOWN;
}

const ICON_PROPS = ['device_type', 'state', 'percentage'] as const;
const ICON = Static(() =>
    watch(Battery.get_default(), ICON_PROPS, bat => {
        switch (state(bat)) {
            case CHARGING:
                return ICONS.Charging(bat.percentage);
            case DISCHARGING:
                return ICONS.Draining(bat.percentage);
            case EMPTY:
                return ICONS.Alert;
            default:
                return ICONS.Icon;
        }
    }),
);

const TOOL_PROPS = [...ICON_PROPS, 'time_to_empty', 'time_to_full'] as const;
const TOOL = Static(() =>
    watch(Battery.get_default(), TOOL_PROPS, bat => {
        const p = Math.floor(bat.percentage * 100);
        switch (state(bat)) {
            case CHARGING:
                return `${p}% (${time(bat.time_to_full)})`;
            case DISCHARGING:
                return `${p}% (${time(bat.time_to_empty)})`;
            case EMPTY:
                return '0%';
            default:
                return '100%';
        }
    }),
);

export default () => (
    <Toggle id="power" label={ICON()} tooltipText={TOOL()}>
        <box class="power menu" orientation={Orientation.VERTICAL}>
            {Object.entries(COMMANDS).map(([name, cmd]) => (
                <button label={(ICONS.Commands as any)[name]} onClicked={() => exec(cmd)} />
            ))}
        </box>
    </Toggle>
);
