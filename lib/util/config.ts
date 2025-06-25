import App from 'ags/gtk4/app';

import Hyprland from 'gi://AstalHyprland';
import GLib from 'gi://GLib';

import style from '../../style.scss';

import * as Icon from './icon';

const UTILS: { [id: string]: string[] | undefined } = {};

export function util(id: string, i: number, ...ctx: any[]) {
    const util = UTILS[id]?.[i]
        .replace(/{(\w+)}/g, (_, k) => String(ctx.reduce((v, c) => v ?? c[k], undefined)))
        .split(' ');
    return util
        ? (Hyprland.get_default().dispatch(util.shift()!, util.join(' ')), true)
        : false;
}

export function reload() {
    let css = style;
    const dir = `${GLib.get_user_config_dir()}/shell`;
    const cfg = new GLib.KeyFile();
    cfg.load_from_file(`${dir}/config`, GLib.KeyFileFlags.NONE);

    const vals: { [key: string]: string } = {};
    const opts = getopts({
        'misc:font_family': 'str',
        'decoration:rounding': 'int',
        'general:border_size': 'int',
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
    vals.image0 = image[0] ? `url("file://${dir}/${image[0]}")` : 'none';
    vals.image1 = image[1] ? `url("file://${dir}/${image[1]}")` : 'none';
    vals.slice0 = slice[0] || '0';
    vals.slice1 = slice[1] || vals.slice0;
    vals.width0 = vals.slice0.replaceAll(/(\d+)/g, '$1px');
    vals.width1 = vals.slice1.replaceAll(/(\d+)/g, '$1px');

    for (const [key, val] of Object.entries(vals)) {
        css = css.replaceAll(`var(--${key})`, val);
    }

    App.apply_css(css, true);

    Icon.reload(key(cfg, 'icons').map(cls => [cls, val(cfg, 'icons', cls, '0f2d0')]));

    for (const id in UTILS) {
        delete UTILS[id];
    }
    for (const id of key(cfg, 'utils')) {
        UTILS[id] = lst(cfg, 'utils', id);
    }

    setLayerRules();
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

const LAYER_RULES = ['unset', 'blur', 'blurpopups', 'ignorealpha 0.2', 'noanim'];

function setLayerRules() {
    Hyprland.get_default().message(
        `[[BATCH]]${LAYER_RULES.map(rule => `keyword layerrule ${rule},shell`).join(';')}`,
    );
}
