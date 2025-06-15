import Hyprland from 'gi://AstalHyprland';

import { state } from '../sub';

import { Static } from './static';

export const SPACE = '\u{f1050}';

export function select(...icons: string[]) {
    return (value: number) => {
        const index = Math.floor(value * icons.length);
        return icons[Math.max(0, Math.min(index, icons.length - 1))];
    };
}

const CLIENT = Static(() => state<[string, string][]>([]));

export function client(client: Hyprland.Client) {
    return CLIENT()[0](
        i => i.find(([cls]) => client.class.toLowerCase().includes(cls))?.[1] ?? '\u{0f2d0}',
    );
}

export namespace client {
    export function reload(icons: [string, string][]) {
        CLIENT()[1](icons.map(([cls, hex]) => [cls, String.fromCodePoint(parseInt(hex, 16))]));
    }
}
