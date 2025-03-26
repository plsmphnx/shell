import { GLib } from 'astal';
import { App } from 'astal/gtk3';

import { Context } from './util';
import { Client } from './icons';

import style from '../style.scss';

export function reload(ctx: Context) {
    let css = style;
    const dir = `${GLib.get_user_config_dir()}/shell`;
    const cfg = new GLib.KeyFile();
    cfg.load_from_file(`${dir}/config`, GLib.KeyFileFlags.NONE);

    const vals: { [key: string]: string } = {};

    const color = lst(cfg, 'style', 'color') || [];
    vals.fg = color[0] || 'white';
    vals.bg = color[1] || 'black';

    const font = val(cfg, 'style', 'font') || 'monospace';
    vals.font = `'${font}'`;

    const round = val(cfg, 'style', 'round') || '0';
    vals.radius = `${round}px`;

    const size = val(cfg, 'border', 'size') || '1';
    vals.border = `${size}px`

    const image = lst(cfg, 'border', 'image');
    const slice = lst(cfg, 'border', 'slice');
    if (image && slice) {
        vals.image0 = `url("${dir}/${image[0]}")`;
        vals.image1 = `url("${dir}/${image[1] || image[0]}")`;
        vals.slice0 = slice[0];
        vals.slice1 = slice[1] || slice[0];
        vals.width0 = vals.slice0.replaceAll(/(\d+)/g, '$1px');
        vals.width1 = vals.slice1.replaceAll(/(\d+)/g, '$1px');
    } else {
        css = css.replaceAll(/\n.*border-image.*\n/g, '\n');
    }

    const gap = val(cfg, 'style', 'gap') || size;
    vals.gap = `${gap}px`;

    for (const [key, val] of Object.entries(vals)) {
        css = css.replaceAll(`var(--${key})`, val);
    }

    App.apply_css(css, true);

    const icons = cfg
        .get_keys('icons')[0]
        .map<[string, string]>(cls => [cls, cfg.get_string('icons', cls)]);
    Client.reload(ctx, icons);
}

function val(cfg: GLib.KeyFile, group: string, key: string) {
    try {
        return cfg.get_string(group, key).trim();
    } catch {
        return undefined;
    }
}

function lst(cfg: GLib.KeyFile, group: string, key: string) {
    try {
        return cfg.get_string_list(group, key).map(v => v.trim());
    } catch {
        return undefined;
    }
}
