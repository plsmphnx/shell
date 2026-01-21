import { createState } from 'ags';
import App from 'ags/gtk4/app';

import Hyprland from 'gi://AstalHyprland';
import GLib from 'gi://GLib';

import style from '../../style.scss';

import * as Border from './border';
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
        'general:border_size': 'int',
        'general:col.active_border': 'custom',
        'misc:background_color': 'int',
        'misc:font_family': 'str',
    });

    const color = lst(cfg, 'style', 'color');
    vals.fg = color[0] || `#${opts['general:col.active_border'].split(' ')[0].slice(2)}`;
    vals.bg =
        color[1] ||
        `#${Number(opts['misc:background_color']).toString(16).padStart(8, '0').slice(2)}`;

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

    const borderMask = val(cfg, 'style', 'border-mask', '11111111');

    const gap = val(cfg, 'style', 'gap', '0');
    vals.gap = `${gap}px`;

    Object.assign(vals, Border.build(rounding, borderSize, borderMask));

    for (const [key, val] of Object.entries(vals)) {
        css = css.replaceAll(`var(--${key})`, val);
    }

    App.reset_css();
    App.apply_css(css, true);

    Icon.reload(key(cfg, 'icons').map(cls => [cls, val(cfg, 'icons', cls, '0f2d0')]));
    Utils.reload(key(cfg, 'utils').map(id => [id, lst(cfg, 'utils', id)]));
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
