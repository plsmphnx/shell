import { createBinding, createMemo, With } from 'ags';
import * as GObject from 'ags/gobject';
import { Gdk, Gtk } from 'ags/gtk4';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { Config, Props } from '../util';

function props(p: string) {
    if (p.startsWith('data:')) {
        return {
            paintable: Gdk.Texture.new_from_bytes(
                GLib.base64_decode(p.slice(p.indexOf(',') + 1)),
            ),
        };
    }
    if (p.startsWith('/')) {
        return Gio.File.new_for_path(p).query_exists(null) && { file: p };
    }
    return p && { iconName: p };
}

function build(icons: string[], rest: Props.Image) {
    const icon = icons.reduce<ReturnType<typeof props>>((i, v) => i || props(v || ''), false);
    return icon ? (
        <image
            class="icon"
            overflow={Overflow.HIDDEN}
            pixelSize={Config.Size.Icon}
            {...icon}
            {...rest}
        />
    ) : undefined;
}

export namespace Icon {
    export type Props = Props.Image & {
        from: GObject.Object;
        icon: string;
    };
}
export const Icon = ({ from, icon, ...rest }: Icon.Props) => {
    const binds = icon.split(' ').map(k => createBinding(from, k as any));
    const icons = createMemo(() => binds.map(b => b()));
    return (
        <box>
            <With value={icons}>{i => build(i, rest)}</With>
        </box>
    );
};
export type Icon = Gtk.Image;
