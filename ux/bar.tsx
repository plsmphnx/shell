import { Widget } from 'astal/gtk3';

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

import { SPACE } from '../lib/icons';
import { Monitor } from '../lib/util';

export default ({ monitor }: Monitor.Props) => (
    <window
        namespace="bar"
        gdkmonitor={monitor.g}
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT}
        exclusivity={Exclusivity.EXCLUSIVE}>
        <centerbox className="bar">
            <box halign={START}>
                <Workspaces monitor={monitor} />
            </box>
            <box halign={CENTER} hexpand>
                <Title monitor={monitor} />
            </box>
            <box halign={END}>
                <box className="status">
                    <label className="hidden" label={SPACE} />
                    <Notifications monitor={monitor} />
                    <Tray />
                    <Mpris monitor={monitor} />
                    <Speaker />
                    <Microphone />
                    <Bluetooth />
                    <Network />
                </box>
                <Clock monitor={monitor} />
                <Power monitor={monitor} />
            </box>
        </centerbox>
    </window>
) as Widget.Window;
