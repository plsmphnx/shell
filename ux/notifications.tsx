import { timeout, Variable } from 'astal';
import Notifd from 'gi://AstalNotifd';

import { Monitor, onClick } from '../lib/util';
import { Action, Dropdown, Image, Lazy, Markup, Toggle } from '../lib/widget';

const ICONS = {
    Icon: '\u{f035c}',
};

const icon = (n: Notifd.Notification) => {
    if (n.image) {
        return <Image className="icon" image={n.image} valign={START} />;
    }

    if (n.desktop_entry || n.app_icon) {
        return <icon className="icon" icon={n.desktop_entry || n.app_icon} valign={START} />;
    }

    return undefined;
};

const popup = (n: Notifd.Notification) => {
    const defaultAction = n.actions.find(({ id }) => id === 'default');
    const customActions = n.actions.filter(({ id }) => id !== 'default');
    return [
        n.id,
        <Action actions={customActions.map(({ id, label }) => [label, () => n.invoke(id)])}>
            <eventbox
                onClick={onClick(
                    () => defaultAction && n.invoke(defaultAction.id),
                    () => n.dismiss(),
                )}>
                {icon(n)}
                <box vertical hexpand vexpand>
                    <Markup className="title" label={n.summary} halign={START} truncate />
                    <Markup label={n.body} halign={START} wrap />
                </box>
            </eventbox>
        </Action>,
    ] as const;
};

export default ({ monitor }: Monitor.Props) => {
    const notifd = Notifd.get_default();

    const all = new Lazy(popup, notifd.notifications);

    const popups = new Lazy(popup);
    const active = Variable(false);
    const hide = (id: number) => {
        popups.del(id);
        if (popups.get().length === 0) {
            active.set(false);
        }
    };
    const show = (n: Notifd.Notification) => {
        popups.add(n);
        active.set(true);
        timeout(5000, () => hide(n.id));
    };

    const conn = [
        notifd.connect('notified', (_, id) => {
            const n = notifd.get_notification(id);
            all.add(n);
            show(n);
        }),
        notifd.connect('resolved', (_, id) => {
            all.del(id);
            hide(id);
        }),
    ];

    const drop = (
        <Dropdown monitor={monitor} reveal={active()}>
            <box vertical>{popups()}</box>
        </Dropdown>
    );

    const bound = all();
    return (
        <Toggle
            monitor={monitor}
            label={ICONS.Icon}
            reveal={bound.as(n => n.length > 0)}
            onReveal={() => active.set(false)}
            onSecondary={() => {
                for (const n of notifd.notifications) {
                    n.dismiss();
                }
            }}
            onDestroy={() => (conn.map(id => notifd.disconnect(id)), drop.destroy())}>
            <box vertical>{bound}</box>
        </Toggle>
    );
};
