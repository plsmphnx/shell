import { Variable } from 'astal';
import Hyprland from 'gi://AstalHyprland';

import { Context } from './util';

export const SPACE = '\u{f1050}';

export function select(...icons: string[]) {
    return (value: number) => {
        const index = Math.floor(value * icons.length);
        return icons[Math.max(0, Math.min(index, icons.length - 1))];
    };
}

export namespace Client {
    const ICONS = Context(() => Variable<[string, string][]>([]));

    export function reload(ctx: Context, icons: [string, string][]) {
        ICONS(ctx).set(
            icons.map(([cls, hex]) => [cls, String.fromCodePoint(parseInt(hex, 16))]),
        );
    }

    export function icon(ctx: Context, client: Hyprland.Client) {
        return ICONS(ctx)(i => {
            for (const [cls, icon] of i) {
                if (client.class.toLowerCase().includes(cls)) {
                    return icon;
                }
            }
            return '\u{0f2d0}';
        });
    }
}
