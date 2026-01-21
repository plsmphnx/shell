import { writeFile } from 'ags/file';

import GLib from 'gi://GLib';

export function build(radius: string, width: string, mask: string) {
    const r = Number(radius);
    const w = Number(width);
    const s = 3 * (r + w);
    const d = [
        `M ${r + w} ${w / 2}`,
        `l ${r + w} 0`,
        `a 5 5 0 0 1 ${r + w / 2} ${r + w / 2}`,
        `l 0 ${r + w}`,
        `a 5 5 0 0 1 -${r + w / 2} ${r + w / 2}`,
        `l -${r + w} 0`,
        `a 5 5 0 0 1 -${r + w / 2} -${r + w / 2}`,
        `l 0 -${r + w}`,
        `a 5 5 0 0 1 ${r + w / 2} -${r + w / 2}`,
        `z`,
    ].join(' ');

    const root = `${GLib.get_user_runtime_dir()}/shell`;

    const svg = `version="1.1" xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"`;
    const path = `stroke="white" fill="transparent" stroke-width="${w}" stroke-linecap="round"`;

    writeFile(`${root}/border.svg`, `<svg ${svg}><path ${path} d="${d}" opacity="0.4"/></svg>`);

    writeFile(
        `${root}/highlight.svg`,
        `<svg ${svg}><path ${path} d="${d}" opacity="0.8"/></svg>`,
    );

    const slice = String(r + w);

    return {
        image0: `url("file://${root}/border.svg")`,
        image1: `url("file://${root}/highlight.svg")`,
        slice0: slice,
        slice1: slice,
        width0: `${slice}px`,
        width1: `${slice}px`,
    };
}
