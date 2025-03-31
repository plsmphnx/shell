import { execAsync, GLib } from 'astal';
import { App } from 'astal/gtk3';
import Hyprland from 'gi://AstalHyprland';

import { Client } from './icons';
import { Context } from './util';
import { StatusProps } from './widget';

import style from '../style.scss';

const UTILS = Context(() => ({} as { [id: string]: string[] | undefined }));

export function utils(ctx: Context, id: string): StatusProps {
    return {
        onPrimary: () => {
            const util = UTILS(ctx)[id]?.[0];
            util && execAsync(util);
        },
        onSecondary: () => {
            const util = UTILS(ctx)[id]?.[1];
            util && execAsync(util);
        },
    };
}

export function reload(ctx: Context) {
    let css = style;
    const dir = `${GLib.get_user_config_dir()}/shell`;
    const cfg = new GLib.KeyFile();
    cfg.load_from_file(`${dir}/config`, GLib.KeyFileFlags.NONE);

    const vals: { [key: string]: string } = {};
    const opts = getopts({
        'misc:font_family': 'str',
        'decoration:rounding': 'int',
        'general:border_size': 'int',
        'general:gaps_in': 'custom',
        'general:gaps_out': 'custom',
    });

    const color = lst(cfg, 'style', 'color');
    vals.fg = color[0] || 'white';
    vals.bg = color[1] || 'black';

    const font = val(cfg, 'style', 'font-family', opts['misc:font_family']);
    vals.font = `'${font}'`;

    const rounding = val(cfg, 'style', 'rounding', opts['decoration:rounding']);
    vals.radius = `${rounding}px`;

    const borderSize = val(cfg, 'style', 'border-size', opts['general:border_size']);
    vals.border = `${borderSize}px`;

    const image = lst(cfg, 'style', 'border-image');
    const slice = lst(cfg, 'style', 'border-slice');
    vals.image0 = image[0] ? `url("${dir}/${image[0]}")` : 'none';
    vals.image1 = image[1] ? `url("${dir}/${image[1]}")` : 'none';
    vals.slice0 = slice[0] || '0';
    vals.slice1 = slice[1] || vals.slice0;
    vals.width0 = vals.slice0.replaceAll(/(\d+)/g, '$1px');
    vals.width1 = vals.slice1.replaceAll(/(\d+)/g, '$1px');

    const hlgap =
        Number(opts['general:gaps_in'].split(' ')[3]) -
        Number(opts['general:gaps_out'].split(' ')[3]);
    const gap = val(cfg, 'style', 'gap', String(Math.max(hlgap, 0)));
    vals.gap = `${gap}px`;

    for (const [key, val] of Object.entries(vals)) {
        css = css.replaceAll(`var(--${key})`, val);
    }

    App.apply_css(css, true);

    Client.reload(
        ctx,
        key(cfg, 'icons').map(cls => [cls, val(cfg, 'icons', cls, '0f2d0')]),
    );

    const utils = UTILS(ctx);
    for (const id in utils) delete utils[id];
    for (const id of key(cfg, 'utils')) {
        utils[id] = lst(cfg, 'utils', id);
    }
}

function val(cfg: GLib.KeyFile, group: string, key: string, def: string) {
    try {
        return cfg.get_string(group, key).trim();
    } catch {
        return def;
    }
}

function lst(cfg: GLib.KeyFile, group: string, key: string) {
    try {
        return cfg.get_string_list(group, key).map(v => v.trim());
    } catch {
        return [];
    }
}

function key(cfg: GLib.KeyFile, group: string) {
    try {
        return cfg.get_keys(group)[0];
    } catch {
        return [];
    }
}

function getopts(vals: { [id: string]: string }) {
    for (const opt of Hyprland.get_default()
        .message(
            `[[BATCH]]${Object.keys(vals)
                .map(id => `j/getoption ${id}`)
                .join(';')}`,
        )
        .split('\n\n')
        .map(res => JSON.parse(res))) {
        vals[opt.option] = String(opt[vals[opt.option]]);
    }
    return vals;
}
