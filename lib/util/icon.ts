import { Accessor, createBinding, createMemo, createState } from 'ags';

import Hyprland from 'gi://AstalHyprland';

export const SPACE = '\u{f1050}';

export function select(...icons: string[]) {
    return (value: number) => {
        const index = Math.floor(value * icons.length);
        return icons[Math.max(0, Math.min(index, icons.length - 1))];
    };
}

const [ICONS, ICONS_] = createState<[string, string][]>([]);
const [MODES, MODES_] = createState<{ [key: string]: string }>({});

export function client(client: Hyprland.Client) {
    const cls = createBinding(client, 'class').as(c => c.toLowerCase());
    return createMemo(() => ICONS().find(([c]) => cls().includes(c))?.[1] || '\u{0f2d0}');
}

export function submap(submap: Accessor<string>) {
    return createMemo(() => MODES()[submap()] ?? submap());
}

export function reload(icons: [string, string][], modes: [string, string][]) {
    ICONS_(parse(icons));
    MODES_(Object.fromEntries(parse(modes)));
}

function parse(pairs: [string, string][]) {
    return pairs.map(
        ([key, hex]) => [key, String.fromCodePoint(parseInt(hex, 16))] as [string, string],
    );
}
