import { bind, Binding, Variable } from 'astal';
import Hyprland from 'gi://AstalHyprland';

import { Client, SPACE } from '../lib/icons';
import { join, reduce } from '../lib/sub';
import { Context, Props } from '../lib/util';
import { Lazy } from '../lib/widget';

interface Labels {
    workspace: { [id: string]: Binding<string> };
    pinned: { [id: string]: Binding<string> };
}

function label(ctx: Context, { clients }: Hyprland.Hyprland) {
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
        ls.workspace[k] = group(ctx, v);
    }
    for (const [k, v] of Object.entries(pinned)) {
        ls.pinned[k] = group(ctx, v);
    }
    return ls;
}

function group(ctx: Context, cs: Hyprland.Client[]) {
    return join(...cs.map(c => join(bind(c, 'x'), bind(c, 'y'), Client.icon(ctx, c)))).as(
        (...rs) =>
            rs
                .sort(([ax, ay], [bx, by]) => ax - bx || ay - by)
                .map(([, , i]) => i)
                .join(' '),
    );
}

const LABELS = Context(ctx => {
    const hyprland = Hyprland.get_default();
    return Variable(label(ctx, hyprland)).observe(
        [
            [hyprland, 'client-added'],
            [hyprland, 'client-removed'],
            [hyprland, 'client-moved'],
            [hyprland, 'floating'],
        ],
        () => label(ctx, hyprland),
    );
});

const SUBMAP = Context(() =>
    Variable('').observe(Hyprland.get_default(), 'submap', (_, s) => s),
);

export default ({ ctx, monitor }: Props) => {
    const hyprland = Hyprland.get_default();
    const f = bind(hyprland, 'focused_workspace');

    const lazy = new Lazy(
        w => [
            w.id,
            <button
                className={f.as(f => (f === w ? 'target' : 'unfocused target'))}
                label={bind(reduce(LABELS(ctx)(l => l.workspace[w.id] || '')))}
                visible={bind(w, 'monitor').as(m => m === monitor)}
                onClicked={() => hyprland.dispatch('workspace', String(w.id))}
            />,
        ],
        hyprland.workspaces.filter(w => w.id > 0),
    );
    const conn = [
        hyprland.connect('workspace-added', (_, w) => w.id > 0 && lazy.add(w)),
        hyprland.connect('workspace-removed', (_, id) => lazy.del(id)),
    ];

    return (
        <box className="workspaces" onDestroy={() => conn.map(id => hyprland.disconnect(id))}>
            {lazy()}
            <box className="dim status">
                <label
                    label={bind(reduce(LABELS(ctx)(l => l.pinned[monitor.name] || '')))}
                    visible={LABELS(ctx)(l => !!l.pinned[monitor.name])}
                />
                <label
                    className={SUBMAP(ctx)(s => (s ? '' : 'hidden'))}
                    label={SUBMAP(ctx)(s => s || SPACE)}
                />
            </box>
        </box>
    );
};
