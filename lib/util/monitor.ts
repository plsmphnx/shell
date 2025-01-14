import { Gdk } from 'astal/gtk4';
import type Gio from 'gi://Gio';
import Hyprland from 'gi://AstalHyprland';

export interface Props {
    monitor: Hyprland.Monitor;
}

export function gdk(monitor?: Hyprland.Monitor) {
    if (!monitor) {
        return {};
    }

    const gdkmonitors = Gdk.Display.get_default()!.get_monitors() as Gio.ListModel<Gdk.Monitor>;
    for (let i = 0; i < gdkmonitors.get_n_items(); i++) {
        const gdkmonitor = gdkmonitors.get_item(i);
        if (gdkmonitor?.connector === monitor.name) {
            return { gdkmonitor };
        }
    }
    return {};
}
