import { Gdk } from 'astal/gtk3';
import Hyprland from 'gi://AstalHyprland';

export interface Props {
    monitor: Hyprland.Monitor;
}

export function gdk(monitor?: Hyprland.Monitor) {
    if (!monitor) {
        return {};
    }

    const display = Gdk.Display.get_default()!;
    const screen = Gdk.Screen.get_default()!;

    for (let i = 0; i < display.get_n_monitors(); i++) {
        if (screen.get_monitor_plug_name(i) === monitor.name) {
            return { gdkmonitor: display.get_monitor(i)! };
        }
    }
    return {};
}
