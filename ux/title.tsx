import { bind } from 'astal';
import Hyprland from 'gi://AstalHyprland';

import { reduce } from '../lib/sub';
import { Context, Event, Props } from '../lib/util';

const CTX = Context(() => {
    const focused = bind(Hyprland.get_default(), 'focused_client');
    return {
        title: bind(reduce(focused.as(f => (f ? bind(f, 'title') : '')))),
        monitor: bind(reduce(focused.as(f => f && bind(f, 'monitor')))),
    };
});

export default ({ ctx, monitor }: Props) => (
    <button
        className="target"
        visible={CTX(ctx).monitor.as(m => m === monitor)}
        {...Event.click('hyprjump movetoworkspace free', () =>
            Hyprland.get_default().dispatch('killactive', ''),
        )}>
        <label label={CTX(ctx).title} truncate />
    </button>
);
