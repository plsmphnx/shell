import { writeFile } from 'ags/file';

import GLib from 'gi://GLib';

const INDEX = [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 0, 2, 2],
    [0, 1, 1, 3],
];

export function build(radius: string, width: string, mask: string) {
    const r = Number(radius);
    const w = Number(width);
    const s = 2 * (r + w) + (r + 2 * w);
    const m = INDEX.map(m => mask[m[mask.length - 1]] === '1');
    const d = [
        `M ${r + w} ${w / 2}`,
        `${m[0] ? 'l' : 'm'} ${r + 2 * w} 0`,
        `${m[0] || m[1] ? 'a 5 5 0 0 1' : 'm'} ${r + w / 2} ${r + w / 2}`,
        `${m[1] ? 'l' : 'm'} 0 ${r + 2 * w}`,
        `${m[1] || m[2] ? 'a 5 5 0 0 1' : 'm'} -${r + w / 2} ${r + w / 2}`,
        `${m[2] ? 'l' : 'm'} -${r + 2 * w} 0`,
        `${m[2] || m[3] ? 'a 5 5 0 0 1' : 'm'} -${r + w / 2} -${r + w / 2}`,
        `${m[3] ? 'l' : 'm'} 0 -${r + 2 * w}`,
        `${m[3] || m[0] ? 'a 5 5 0 0 1' : 'm'} ${r + w / 2} -${r + w / 2}`,
    ].join(' ');

    const root = `${GLib.get_user_runtime_dir()}/shell`;

    const svg = `version="1.1" xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"`;
    const path = `stroke="white" fill="transparent" stroke-width="${w}" stroke-linecap="round"`;

    writeFile(`${root}/border.svg`, `<svg ${svg}><path ${path} d="${d}" opacity="0.4"/></svg>`);

    writeFile(
        `${root}/highlight.svg`,
        `<svg ${svg}><path ${path} d="${d}" opacity="0.8"/></svg>`,
    );

    const slice = String(r + 2 * w);

    return {
        image0: `url("file://${root}/border.svg")`,
        image1: `url("file://${root}/highlight.svg")`,
        slice0: slice,
        slice1: slice,
        width0: `${slice}px`,
        width1: `${slice}px`,
    };
}
