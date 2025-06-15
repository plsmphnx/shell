import { Icon, Monitor } from '../lib/util';

import { Speaker, Microphone } from './audio';
import Bluetooth from './bluetooth';
import Clock from './clock';
import Mpris from './mpris';
import Network from './network';
import Notifications from './notifications';
import Power from './power';
import Title from './title';
import Tray from './tray';
import Workspaces from './workspaces';

export default () => (
    <window
        {...Monitor.window()}
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT}
        exclusivity={Exclusivity.EXCLUSIVE}
        visible>
        <centerbox class="bar">
            <box _type="start">
                <Workspaces />
            </box>
            <box _type="center">
                <Title />
            </box>
            <box _type="end">
                <box class="status">
                    <label class="hidden" label={Icon.SPACE} />
                    <Notifications />
                    <Tray />
                    <Mpris />
                    <Speaker />
                    <Microphone />
                    <Bluetooth />
                    <Network />
                </box>
                <Clock />
                <box class="status">
                    <Power />
                </box>
            </box>
        </centerbox>
    </window>
);
