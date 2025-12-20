import { createBinding, createMemo, createState } from 'ags';

import Hyprland from 'gi://AstalHyprland';

export const SPACE = '\u{f1050}';

export function select(...icons: string[]) {
    return (value: number) => {
        const index = Math.floor(value * icons.length);
        return icons[Math.max(0, Math.min(index, icons.length - 1))];
    };
}

const [CLIENT, CLIENT_] = createState<[string, string][]>([]);

export function client(client: Hyprland.Client) {
    const cls = createBinding(client, 'class').as(c => c.toLowerCase());
    return createMemo(() => CLIENT().find(([c]) => cls().includes(c))?.[1] || '\u{0f2d0}');
}

export function reload(icons: [string, string][]) {
    CLIENT_(icons.map(([cls, hex]) => [cls, String.fromCodePoint(parseInt(hex, 16))]));
}
