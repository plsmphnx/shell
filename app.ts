import { createRoot, For } from 'ags';
import { Gdk } from 'ags/gtk4';
import App from 'ags/gtk4/app';

import './globals';

import { bind } from './lib/sub';
import { Config, Monitor } from './lib/util';

import Bar from './ux/bar';
import Launcher from './ux/launcher';

App.start({
    main() {
        Config.reload();
        For({
            each: bind(App, 'monitors'),
            children: (gdk: Gdk.Monitor) => Monitor.Context({ value: { gdk }, children: Bar }),
        });
    },

    client(msg: (msg: string) => string, ...args: string[]) {
        console.log(msg(args.join(' ')));
    },

    requestHandler(req, ret) {
        switch (req) {
            case 'launch':
                createRoot(Launcher);
                break;
            case 'reload':
                Config.reload();
                break;
            case 'quit':
                App.quit();
                break;
        }
        ret('');
    },
});
