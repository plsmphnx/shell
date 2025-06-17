import { For } from 'ags';
import App from 'ags/gtk4/app';

import './globals';

import { bind } from './lib/sub';
import { Config } from './lib/util';

import Monitor from './ux/monitor';
import * as Launcher from './ux/launcher';

App.start({
    main() {
        Config.reload();
        For({ each: bind(App, 'monitors'), children: Monitor });
    },

    client(msg: (msg: string) => string, ...args: string[]) {
        console.log(msg(args.join(' ')));
    },

    requestHandler(req, ret) {
        switch (req) {
            case 'launch':
                Launcher.open();
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
