import { Accessor, For } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { bind, compute, connect, filter, reduce, watch } from '../lib/sub';
import { Icon, Monitor, Static } from '../lib/util';
import { Event } from '../lib/widget';

function clients<K extends Extract<keyof Hyprland.Client, string>>(
    keys: readonly K[],
    cb: (c: Pick<Hyprland.Client, K>) => boolean | Accessor<boolean>,
) {
    return reduce(
        compute([bind(Hyprland.get_default(), 'clients'), Icon.client()], (cs, icon) =>
            filter(cs, c => reduce(watch(c, keys, cb))).as(cs => cs.map(icon).sort().join(' ')),
        ),
    );
}

const SUBMAP = Static(() => connect('', [Hyprland.get_default(), 'submap', s => s]));

export default () => {
    const hyprland = Hyprland.get_default();
    const f = bind(hyprland, 'focused_workspace');
    const { gdk } = Monitor.Context.use();

    const workspace = (w: Hyprland.Workspace) => (
        <label
            class={f.as(f => (f === w ? 'target' : 'unfocused target'))}
            label={clients(['workspace', 'floating'], c => !c.floating && c.workspace === w)}
            visible={Monitor.is(bind(w, 'monitor'), gdk)}>
            <Event.Click onLeft={() => hyprland.dispatch('workspace', String(w.id))} />
        </label>
    );

    const ws = bind(hyprland, 'workspaces');
    const cs = clients(['monitor', 'floating'], c => c.floating && Monitor.is(c.monitor, gdk));
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
