import { Accessor, createBinding, createContext, createComputed } from 'ags';
import { Gdk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

export interface Current {
    gdk: Gdk.Monitor;
}

export const Context = createContext<Current>(undefined!);

export function is(mon: Accessor<Hyprland.Monitor>, gdk = Context.use().gdk) {
    const connector = createBinding(gdk, 'connector');
    return createComputed(() => connector() === (mon() && createBinding(mon(), 'name')()));
}
