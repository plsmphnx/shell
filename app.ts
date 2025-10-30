import { For } from 'ags';
import App from 'ags/gtk4/app';
import { exec } from 'ags/process';

import './globals';

import { bind } from './lib/sub';
import { Config } from './lib/util';

import Monitor from './ux/monitor';
import * as Launcher from './ux/launcher';

App.start({
    main() {
        Config.reload();
        For({ each: bind(App, 'monitors'), children: Monitor });
        exec('systemd-notify --ready');
    },

    requestHandler(req, res) {
        switch (req.shift()) {
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
        res('');
    },
});
