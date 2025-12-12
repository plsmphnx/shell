import { Accessor, createState } from 'ags';

import Hyprland from 'gi://AstalHyprland';

export const SPACE = '\u{f1050}';

export function select(...icons: string[]) {
    return (value: number) => {
        const index = Math.floor(value * icons.length);
        return icons[Math.max(0, Math.min(index, icons.length - 1))];
    };
}

const [CLIENT, CLIENT_] = createState<[string, string][]>([]);

export function client(): Accessor<(client: Hyprland.Client) => string> {
    return CLIENT.as(
        i => c => i.find(([cls]) => c.class.toLowerCase().includes(cls))?.[1] || '\u{0f2d0}',
    );
}

export function reload(icons: [string, string][]) {
    CLIENT_(icons.map(([cls, hex]) => [cls, String.fromCodePoint(parseInt(hex, 16))]));
}
