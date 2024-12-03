import { App } from 'astal/gtk3';
import Hyprland from 'gi://AstalHyprland';

import './globals';
import style from './style.scss';

import { Client } from './lib/icons';
import { Context } from './lib/util';

import Bar from './ux/bar';
import Launcher from './ux/launcher';

const ctx: Context = {};

App.start({
    css: style,
    main() {
        Client.reload(ctx);
        const hyprland = Hyprland.get_default();
        const lazy = new Map(hyprland.monitors.map(m => [m.id, Bar({ ctx, monitor: m })]));
        hyprland.connect('monitor-added', (_, m) => lazy.set(m.id, Bar({ ctx, monitor: m })));
        hyprland.connect('monitor-removed', (_, m) => (lazy.get(m)?.close(), lazy.delete(m)));
    },

    client(msg: (msg: string) => string, ...args: string[]) {
        console.log(msg(args.join(' ')));
    },

    requestHandler(req, ret) {
        switch (req) {
            case 'launch':
                Launcher();
                break;
            case 'reload':
                Client.reload(ctx);
                break;
            case 'quit':
                App.quit();
                break;
        }
        ret('');
    },
});
