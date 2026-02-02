import { createState } from 'ags';
import App from 'ags/gtk4/app';

import Hyprland from 'gi://AstalHyprland';
import GLib from 'gi://GLib';

import style from '../../style.scss';

import * as Icon from './icon';
import * as Utils from './utils';

const [TEXT, TEXT_] = createState(0);

export namespace Size {
    export const Text = TEXT;
    export const Margin = TEXT.as(t => t / 2);
    export const Icon = TEXT.as(t => 3 * t);
    export const Popup = TEXT.as(t => 24 * t);
}

export function reload() {
    let css = style;
    const dir = `${GLib.get_user_config_dir()}/shell`;
    const cfg = new GLib.KeyFile();
    cfg.load_from_file(`${dir}/config`, GLib.KeyFileFlags.NONE);

    const vals: { [key: string]: string } = {};
    const opts = getopts({
        'decoration:rounding': 'int',
        'decoration:shadow:color': 'int',
        'general:border_size': 'int',
        'general:col.active_border': 'custom',
        'general:gaps_out': 'custom',
        'misc:background_color': 'int',
        'misc:font_family': 'str',
    });

    const color = lst(cfg, 'style', 'color');
    vals.fg = color[0] || `#${opts['general:col.active_border'].split(' ')[0].slice(2)}`;
    vals.bg = color[1] || i2c(opts['misc:background_color']);

    const text = val(cfg, 'style', 'font-size', '14');
    TEXT_(Number(text));
    vals.text = `${Size.Text.peek()}px`;
    vals.margin = `${Size.Margin.peek()}px`;
    vals.icon = `${Size.Icon.peek()}px`;
    vals.popup = `${Size.Popup.peek()}px`;

    const font = val(cfg, 'style', 'font-family', opts['misc:font_family']);
    vals.font = `'${font}'`;

    const rounding = val(cfg, 'style', 'rounding', opts['decoration:rounding']);
    vals.radius = `${rounding}px`;

    const borderSize = val(cfg, 'style', 'border-size', opts['general:border_size']);
    vals.border = `${borderSize}px`;

    const gaps = val(cfg, 'style', 'gaps', opts['general:gaps_out']);
    vals.gaps = is2px(gaps);

    const image = lst(cfg, 'style', 'border-image');
    const slice = lst(cfg, 'style', 'border-slice');
    vals.image0 = image[0] ? `url("file://${dir}/${image[0]}")` : 'none';
    vals.image1 = image[1] ? `url("file://${dir}/${image[1]}")` : vals.image0;
    vals.image2 = image[2] ? `url("file://${dir}/${image[2]}")` : vals.image0;
    vals.slice0 = slice[0] || '0';
    vals.slice1 = slice[1] || vals.slice0;
    vals.slice2 = slice[2] || vals.slice0;
    vals.width0 = is2px(vals.slice0);
    vals.width1 = is2px(vals.slice1);
    vals.width2 = is2px(vals.slice2);

    const shadow = i2c(opts['decoration:shadow:color']);
    const shadowColor = val(cfg, 'style', 'shadow-color', shadow);
    const shadowAlpha = val(cfg, 'style', 'shadow-alpha', 0.2);
    vals.shadow = `alpha(${shadowColor}, ${2 * Number(shadowAlpha)})`;

    for (const [key, val] of Object.entries(vals)) {
        css = css.replaceAll(`var(--${key})`, val);
    }

    App.apply_css(css, true);

    Icon.reload(key(cfg, 'icons').map(cls => [cls, val(cfg, 'icons', cls, '0f2d0')]));
    Utils.reload(key(cfg, 'utils').map(id => [id, lst(cfg, 'utils', id)]));
}

function val(cfg: GLib.KeyFile, group: string, key: string, def: any) {
    try {
        return cfg.get_string(group, key).trim();
    } catch {
        return String(def);
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

function i2c(val: string) {
    return `#${Number(val).toString(16).padStart(8, '0').slice(2)}`;
}

function is2px(val: string) {
    return val.replaceAll(/(\d+)/g, '$1px');
}
