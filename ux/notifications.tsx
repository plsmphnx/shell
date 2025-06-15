import { Accessor, For, Setter } from 'ags';

import Notifd from 'gi://AstalNotifd';

import { after, bind, compute, state } from '../lib/sub';
import { Event } from '../lib/util';
import { Action, Icon, Text, Toggle } from '../lib/widget';

const ICONS = {
    Icon: '\u{f035c}',
};

const notify = (n: Notifd.Notification, open: Accessor<boolean>, count_: Setter<number>) => {
    count_(c => c + 1);
    const reveal = compute([after(5000, () => count_(c => c - 1)), open], (u, o) => u || o);

    const defaultAction = n.actions.find(({ id }) => id === 'default');
    const customActions = n.actions.filter(({ id }) => id !== 'default');
    return (
        <revealer
            revealChild={reveal}
            transitionType={Transition.SLIDE_DOWN}
            transitionDuration={500}>
            <Action actions={customActions.map(({ id, label }) => [label, () => n.invoke(id)])}>
                <Event.Click
                    $left={() => defaultAction && n.invoke(defaultAction.id)}
                    $right={() => n.dismiss()}
                />
                <Icon
                    from={n}
                    icon={[{ file: 'image' }, { icon: 'desktop_entry' }, { icon: 'app_icon' }]}
                    valign={Align.START}
                />
                <Text.Box orientation={Orientation.VERTICAL}>
                    <Text class="title" label={n.summary} />
                    <Text label={n.body} wrap />
                </Text.Box>
            </Action>
        </revealer>
    );
};

export default () => {
    const notifd = Notifd.get_default();
    const notifications = bind(notifd, 'notifications');

    const [open, open_] = state(false);
    const [count, count_] = state(0);

    return (
        <Toggle
            id="notifications"
            label={ICONS.Icon}
            visible={notifications(n => n.length > 0)}
            drop={count(n => n > 0)}
            $open={(_, o) => open_(o)}
            $secondary={() => {
                for (const n of notifd.notifications) {
                    n.dismiss();
                }
            }}>
            <box orientation={Orientation.VERTICAL}>
                <For each={notifications}>{n => notify(n, open, count_)}</For>
            </box>
        </Toggle>
    );
};
