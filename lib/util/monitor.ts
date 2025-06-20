import { Accessor, createContext } from 'ags';
import { Gdk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

import { bind, compute, reduce } from '../sub';

export interface Current {
    gdk: Gdk.Monitor;
}

export const Context = createContext<Current>(undefined!);

export function is(
    mon: Hyprland.Monitor | Accessor<Hyprland.Monitor>,
    gdk = Context.use().gdk,
) {
    return compute(
        [
            bind(gdk, 'connector'),
            mon instanceof Accessor
                ? reduce(mon.as(m => m && bind(m, 'name')))
                : bind(mon, 'name'),
        ],
        (c, n) => c === n,
    );
}
