import { App } from 'astal/gtk3';
import Hyprland from 'gi://AstalHyprland';

import './globals';
import style from './style.scss';

import { Client } from './lib/icons';
import { Monitor } from './lib/util';

import Bar from './ux/bar';
import Launcher from './ux/launcher';

App.start({
    css: style,
    main() {
        Client.reload();
        const hyprland = Hyprland.get_default();
        const lazy = new Map(hyprland.monitors.map(m => [m.id, Bar(Monitor.resolve(m))]));
        hyprland.connect('monitor-added', (_, m) => lazy.set(m.id, Bar(Monitor.resolve(m))));
        hyprland.connect('monitor-removed', (_, m) => (lazy.get(m)?.close(), lazy.delete(m)));
    },
    requestHandler(req, ret) {
        switch (req) {
            case 'launch':
                Launcher();
                break;
            case 'reload':
                Client.reload();
                break;
        }
        ret('');
    },
});
