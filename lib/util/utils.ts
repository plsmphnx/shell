import { exec } from 'ags/process';

let UTILS: { [id: string]: string[] | undefined } = {};

export function run(id: string, i: number, ...ctx: any[]) {
    const util = UTILS[id]?.[i]?.replace(/{(\w+)}/g, (_, k) =>
        String(ctx.reduce((v, c) => v ?? c[k], undefined)),
    );
    return util ? (exec(util), true) : false;
}

export function reload(utils: [string, string[]][]) {
    const sub: { [id: string]: string } = {};
    UTILS = {};
    for (const [id, cmd] of utils) {
        if (id.startsWith('$')) {
            sub[id] = cmd[0] || '';
        } else {
            UTILS[id] = cmd.map(u =>
                Object.entries(sub).reduce((u, [k, v]) => u.replaceAll(k, v), u),
            );
        }
    }
}
