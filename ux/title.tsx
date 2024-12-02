import { bind } from 'astal';
import Hyprland from 'gi://AstalHyprland';

import { reduce } from '../lib/sub';
import { Monitor, onClick } from '../lib/util';

const hyprland = Hyprland.get_default();

const focused = bind(hyprland, 'focused_client');
const focusedTitle = bind(reduce(focused.as(f => (f ? bind(f, 'title') : ''))));
const focusedMonitor = bind(reduce(focused.as(f => f && bind(f, 'monitor'))));

export default ({ monitor }: Monitor.Props) => (
    <button
        className="target"
        visible={focusedMonitor.as(m => m === monitor.h)}
        {...onClick('hyprnome -me', () => hyprland.dispatch('killactive', ''))}>
        <label label={focusedTitle} truncate />
    </button>
);
