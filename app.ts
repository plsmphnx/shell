import { createBinding, For } from 'ags';
import App from 'ags/gtk4/app';
import { exec } from 'ags/process';

import './globals';

import { Config, Static } from './lib/util';

import Monitor from './ux/monitor';
import * as Launcher from './ux/launcher';
import * as Share from './ux/share';

App.start({
    main() {
        Static.init();
        Config.reload();
        For({ each: createBinding(App, 'monitors'), children: Monitor });
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
            case 'share':
                Share.open(req, res);
                return;
            case 'quit':
                App.quit();
                break;
        }
        res('');
    },
});
