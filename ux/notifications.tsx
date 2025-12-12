import { createBinding, createComputed, createState, For } from 'ags';

import Notifd from 'gi://AstalNotifd';

import { popup } from '../lib/util';
import { Action, Event, Icon, Text, Toggle } from '../lib/widget';

const ICONS = {
    Icon: '\u{f035c}',
};

const notify = (n: Notifd.Notification, pop_: (ms: number) => void) => {
    const open = Toggle.open('notifications');
    const [up, up_] = popup();
    const [hover, hover_] = createState(false);

    const defaultAction = n.actions.find(({ id }) => id === 'default');
    const customActions = n.actions.filter(({ id }) => id !== 'default');
    return (
        <revealer
            revealChild={createComputed(() => open() || up() || hover())}
            transitionType={Transition.SLIDE_DOWN}
            transitionDuration={1000}
            $={() => (pop_(5000), up_(5000))}>
            <Action actions={customActions.map(({ id, label }) => [label, () => n.invoke(id)])}>
                <Event.Click
                    onLeft={() => defaultAction && n.invoke(defaultAction.id)}
                    onRight={() => n.dismiss()}
                />
                <Event.Hover onHover={(_, h) => hover_(h)} />
                <Icon from={n} icon="image desktop_entry app_icon" valign={Align.START} />
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
    const notifications = createBinding(notifd, 'notifications');

    const [pop, pop_] = popup();
    const [hover, hover_] = createState(false);

    return (
        <Toggle
            id="notifications"
            label={ICONS.Icon}
            reveal={notifications.as(n => n.length > 0)}
            drop={createComputed(() => pop() || hover())}
            onSecondary={() => {
                for (const n of notifd.notifications) {
                    n.dismiss();
                }
            }}>
            <box orientation={Orientation.VERTICAL}>
                <Event.Hover onHover={(_, h) => hover_(h)} />
                <For each={notifications}>{n => notify(n, pop_)}</For>
            </box>
        </Toggle>
    );
};
