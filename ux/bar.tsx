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
import { Monitor, Props } from '../lib/util';

export default ({ ctx, monitor }: Props) =>
    (
        <window
            namespace="bar"
            {...Monitor.gdk(monitor)}
            anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT}
            exclusivity={Exclusivity.EXCLUSIVE}>
            <centerbox className="bar">
                <box halign={START}>
                    <Workspaces ctx={ctx} monitor={monitor} />
                </box>
                <box halign={CENTER} hexpand>
                    <Title ctx={ctx} monitor={monitor} />
                </box>
                <box halign={END}>
                    <box className="status">
                        <label className="hidden" label={SPACE} />
                        <Notifications ctx={ctx} monitor={monitor} />
                        <Tray />
                        <Mpris ctx={ctx} monitor={monitor} />
                        <Speaker ctx={ctx} />
                        <Microphone ctx={ctx} />
                        <Bluetooth ctx={ctx} />
                        <Network ctx={ctx} />
                    </box>
                    <Clock ctx={ctx} monitor={monitor} />
                    <Power ctx={ctx} monitor={monitor} />
                </box>
            </centerbox>
        </window>
    ) as Widget.Window;
