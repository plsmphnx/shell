import { Icon } from '../lib/util';
import { Window } from '../lib/widget';

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
    <Window
        kind="bar"
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT}
        exclusivity={Exclusivity.EXCLUSIVE}
        visible>
        <centerbox class="bar">
            <box $type="start">
                <Workspaces />
            </box>
            <box $type="center">
                <Title />
            </box>
            <box $type="end">
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
    </Window>
);
