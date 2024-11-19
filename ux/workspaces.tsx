import { bind, Binding, Variable } from 'astal';
import Hyprland from 'gi://AstalHyprland';

import { Client, SPACE } from '../lib/icons';
import { join, reduce } from '../lib/sub';
import { Monitor } from '../lib/util';
import { Lazy } from '../lib/widget';

const hyprland = Hyprland.get_default();

const submap = Variable('').observe(hyprland, 'submap', (_, s) => s);

interface Labels {
    workspace: { [id: string]: Binding<string> };
    pinned: { [id: string]: Binding<string> };
}

function label({ clients }: Hyprland.Hyprland) {
    const workspace: { [id: PropertyKey]: Hyprland.Client[] } = {};
    const pinned: { [id: PropertyKey]: Hyprland.Client[] } = {};
    for (const c of clients) {
        if (c.workspace.id > 0 && c.pid > 0) {
            const id = c.pinned ? c.monitor.name : c.workspace.id;
            const g = c.pinned ? pinned : workspace;
            g[id] = g[id] || [];
            g[id].push(c);
        }
    }
    const ls: Labels = { workspace: {}, pinned: {} };
    for (const [k, v] of Object.entries(workspace)) {
        ls.workspace[k] = group(v);
    }
    for (const [k, v] of Object.entries(pinned)) {
        ls.pinned[k] = group(v);
    }
    return ls;
}

function group(cs: Hyprland.Client[]) {
    const bs = cs.map(c => join(bind(c, 'x'), bind(c, 'y'), Client.icon(c)));
    return bind(join(...bs)).as(rs =>
        rs
            .sort(([ax, ay], [bx, by]) => ax - bx || ay - by)
            .map(([, , i]) => i)
            .join(' '),
    );
}

const labels = Variable(label(hyprland)).observe(
    [
        [hyprland, 'client-added'],
        [hyprland, 'client-removed'],
        [hyprland, 'client-moved'],
        [hyprland, 'floating'],
    ],
    () => label(hyprland),
);

export default ({ monitor }: Monitor.Props) => {
    const f = bind(hyprland, 'focused_workspace');
    const filter = (w: Hyprland.Workspace) => w.id > 0 && w.monitor === monitor.h;

    const lazy = new Lazy(
        w => [
            w.id,
            <button
                className={f.as(f => (f === w ? 'target' : 'unfocused target'))}
                label={bind(reduce(labels(l => l.workspace[w.id] || '')))}
                onClicked={() => hyprland.dispatch('workspace', String(w.id))}
            />,
        ],
        hyprland.workspaces.filter(filter),
    );
    const conn = [
        hyprland.connect('workspace-added', (_, w) => filter(w) && lazy.add(w)),
        hyprland.connect('workspace-removed', (_, id) => lazy.del(id)),
    ];

    return (
        <box className="workspaces" onDestroy={() => conn.map(id => hyprland.disconnect(id))}>
            {lazy()}
            <box className="dim status">
                <label
                    label={bind(reduce(labels(l => l.pinned[monitor.h.name] || '')))}
                    visible={labels(l => !!l.pinned[monitor.h.name])}
                />
                <label
                    className={submap(s => (s ? '' : 'hidden'))}
                    label={submap(s => s || SPACE)}
                />
            </box>
        </box>
    );
};
