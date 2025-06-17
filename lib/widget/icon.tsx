import * as GObject from 'ags/gobject';
import { Gtk } from 'ags/gtk4';

import { bind, compute } from '../sub';
import { Props, Select } from '../util';

const IMAGE: { [t: string]: (p: string) => string } = {
    icon: p => `-gtk-icontheme("${p}")`,
    file: p => `url("file://${p}")`,
    url: p => `url("${p}")`,
};

export namespace Icon {
    export type Props<T extends GObject.Object> = Props.Box & {
        from: T;
        icon: {
            icon?: keyof Select<T, string>;
            file?: keyof Select<T, string>;
            url?: keyof Select<T, string>;
        }[];
    };
}
export const Icon = <T extends GObject.Object>({ from, icon, ...rest }: Icon.Props<T>) => {
    const icons = icon.map(i => Object.entries(i)[0]);
    const css = compute(icons.map(([, k]) => bind(from, k)))(ps => {
        const i = ps.findIndex(p => p);
        return i >= 0 ? `background-image:${IMAGE[icons[i][0]](ps[i] as string)};` : '';
    });
    return <box {...rest} class={css(css => css && 'icon')} css={css} />;
};
export type Icon = Gtk.Box;
