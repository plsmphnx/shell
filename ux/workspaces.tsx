import { createBinding, createComputed, createConnection, For } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { Icon, Monitor, Static } from '../lib/util';
import { Event } from '../lib/widget';

function clients(cb: (c: Hyprland.Client) => boolean) {
    const clients = createBinding(Hyprland.get_default(), 'clients');
    const icon = (c: Hyprland.Client) => Icon.client(c)();
    return createComputed(() => clients().filter(cb).map(icon).sort().join(' '));
}

const SUBMAP = Static(() => createConnection('', [Hyprland.get_default(), 'submap', s => s]));

export default () => {
    const hyprland = Hyprland.get_default();
    const focused = createBinding(hyprland, 'focused_workspace');
    const { gdk } = Monitor.Context.use();

    const workspace = (ws: Hyprland.Workspace) => (
        <label
            class={focused.as(f => (f === ws ? 'target' : 'unfocused target'))}
            label={clients(
                c => !createBinding(c, 'floating')() && createBinding(c, 'workspace')() === ws,
            )}
            visible={Monitor.is(createBinding(ws, 'monitor'), gdk)}>
            <Event.Click onLeft={() => hyprland.dispatch('workspace', String(ws.id))} />
        </label>
    );

    const ws = createBinding(hyprland, 'workspaces');
    const cs = clients(
        c => createBinding(c, 'floating')() && Monitor.is(createBinding(c, 'monitor'), gdk)(),
    );
    return (
        <box class="workspaces">
            <box>
                <For each={ws.as(ws => ws.filter(w => w.id > 0).sort((a, b) => a.id - b.id))}>
                    {workspace}
                </For>
            </box>
            <box class="dim status">
                <label label={cs} visible={cs.as(cs => !!cs)} />
                <label
                    class={SUBMAP().as(s => (s ? '' : 'hidden'))}
                    label={SUBMAP().as(s => s || Icon.SPACE)}
                />
            </box>
        </box>
    );
};
