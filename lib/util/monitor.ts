import { Accessor, createContext } from 'ags';
import { Gdk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

export interface Current {
    gdk: Gdk.Monitor;
}

export const Context = createContext<Current | undefined>(undefined);

export function window() {
    return { namespace: 'shell', gdkmonitor: Context.use()?.gdk };
}

export function is(acc: Accessor<Hyprland.Monitor>): Accessor<boolean>;
export function is(): (mon?: Hyprland.Monitor) => boolean;
export function is(acc?: Accessor<Hyprland.Monitor>) {
    const current = Context.use()?.gdk;
    const is = (monitor?: Hyprland.Monitor) => current?.connector === monitor?.name;
    return acc ? acc(is) : is;
}
