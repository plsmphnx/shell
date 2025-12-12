import { Accessor, createBinding, createContext, createComputed } from 'ags';
import { Gdk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

export interface Current {
    gdk: Gdk.Monitor;
}

export const Context = createContext<Current>(undefined!);

export function is(
    mon: Hyprland.Monitor | Accessor<Hyprland.Monitor>,
    gdk = Context.use().gdk,
) {
    const connector = createBinding(gdk, 'connector');
    const name =
        mon instanceof Accessor
            ? createComputed(() => (mon() ? createBinding(mon(), 'name')() : ''))
            : createBinding(mon, 'name');
    return createComputed(() => connector() === name());
}
