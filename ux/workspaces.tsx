import { For } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { bind, compute, observe, reduce } from '../lib/sub';
import { Event, Icon, Monitor, Static } from '../lib/util';

function clients(cb: (c: Hyprland.Client) => boolean) {
    const hyprland = Hyprland.get_default();

    const map = Object.fromEntries(hyprland.clients.filter(cb).map(c => [c.address, c]));
    let set = Object.values(map);

    const add = (c: Hyprland.Client) =>
        c.address in map ? set : ((map[c.address] = c), (set = Object.values(map)));
    const del = (address: string) =>
        address in map ? (delete map[address], (set = Object.values(map))) : set;
    const mov = (c: Hyprland.Client) => (cb(c) ? add(c) : del(c.address));

    return reduce(
        observe(set, hyprland, {
            'client-added': mov,
            'client-removed': del,
            'client-moved': mov,
            floating: mov,
        })(cs => compute(cs.map(Icon.client))(i => i.sort().join(' '))),
    );
}

const SUBMAP = Static(() => observe('', Hyprland.get_default(), { submap: s => s }));

export default () => {
    const hyprland = Hyprland.get_default();
    const f = bind(hyprland, 'focused_workspace');
    const is = Monitor.is();

    const workspace = (w: Hyprland.Workspace) => (
        <label
            class={f(f => (f === w ? 'target' : 'unfocused target'))}
            label={clients(c => c.workspace === w && !c.floating)}
            visible={bind(w, 'monitor')(is)}>
            <Event.Click $left={() => hyprland.dispatch('workspace', String(w.id))} />
        </label>
    );

    const ws = bind(hyprland, 'workspaces');
    const cs = clients(c => is(c.monitor) && c.floating);
    return (
        <box class="workspaces">
            <box>
                <For each={ws(ws => ws.filter(w => w.id > 0).sort((a, b) => a.id - b.id))}>
                    {workspace}
                </For>
            </box>
            <box class="dim status">
                <label label={cs} visible={cs(cs => !!cs)} />
                <label
                    class={SUBMAP()(s => (s ? '' : 'hidden'))}
                    label={SUBMAP()(s => s || Icon.SPACE)}
                />
            </box>
        </box>
    );
};
