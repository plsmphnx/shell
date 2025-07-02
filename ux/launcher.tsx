import { For, Fragment, State } from 'ags';
import { Gtk } from 'ags/gtk4';

import Apps from 'gi://AstalApps';
import Gio from 'gi://Gio';

import { compute, listen, state } from '../lib/sub';
import { Props, Static, Utils } from '../lib/util';
import { Closer, Event, Icon, Text, Popup } from '../lib/widget';

const ICONS = {
    More: '\u{f0142}',
    Less: '\u{f0140}',
};

const [TEXT, TEXT_] = state('');

const APPS = Static(() => new Apps.Apps({ min_score: 0.5 }));

const LIST = Static(() =>
    compute([Closer.open('launcher')[0], TEXT], (o, t) => (o ? APPS().exact_query(t) : [])),
);

const OFFSET = Static(() => new Gtk.Adjustment());

const DROP = Symbol();

function launch(app: Apps.Application, action?: string) {
    close();
    app.frequency++;
    const info = app.app as Gio.DesktopAppInfo;
    const util = (i: number) => Utils.run('launcher', i, app, { action });
    action
        ? util(1) || util(0) || info.launch_action(action, null)
        : util(0) || info.launch([], null);
}

const item = (app: Apps.Application, entry: Gtk.Entry, view: Gtk.Viewport) => {
    const Enter = () => (
        <Event.Hover onHover={(e, h) => h && !entry.is_focus && e.widget.grab_focus()} />
    );
    type Actions = { open: () => void; close: () => void; toggle: () => void };
    const Primary = ({ actions, children }: Props.Button & { actions?: Actions }) => (
        <button>
            <Event.Click onLeft={primary} onRight={actions?.toggle} />
            <Event.Key onReturn={primary} onRight={actions?.open} onLeft={actions?.close} />
            <Enter />
            <box>
                <Icon from={app} icon="icon_name" />
                <Text label={app.name} />
                <Fragment>{children}</Fragment>
            </box>
        </button>
    );
    const primary = () => launch(app);

    const info = app.app as Gio.DesktopAppInfo;
    const list = info.list_actions();
    if (list.length > 0) {
        const [show, show_] = ((app as any)[DROP] ||
            ((app as any)[DROP] = state(false))) as State<boolean>;
        let primary: Gtk.Button;
        let secondary: Gtk.Button;

        const open = () => (primary.grab_focus(), show_(true));
        const close = () => (primary.grab_focus(), show_(false));
        const toggle = () => show_(s => !s);

        return (
            <box orientation={Orientation.VERTICAL}>
                <Primary $={self => (primary = self)} actions={{ open, close, toggle }}>
                    <Text class="actions" label={show.as(s => (s ? ICONS.Less : ICONS.More))} />
                </Primary>
                <revealer
                    revealChild={show}
                    transitionType={Transition.SLIDE_DOWN}
                    onNotifyChildRevealed={self =>
                        view.scroll_to(self.child_revealed ? secondary : primary, null)
                    }>
                    <box orientation={Orientation.VERTICAL}>
                        {list.map(a => {
                            const action = () => launch(app, a);
                            return (
                                <button $={self => (secondary = self)}>
                                    <Event.Click onLeft={action} />
                                    <Event.Key onReturn={action} onLeft={close} />
                                    <Enter />
                                    <Text label={info.get_action_name(a) || a} />
                                </button>
                            );
                        })}
                    </box>
                </revealer>
            </box>
        );
    } else {
        return <Primary />;
    }
};

export default () => {
    const [open] = Closer.open('launcher');

    let entry: Gtk.Entry;
    let view: Gtk.Viewport;

    return (
        <Popup visible={open} transitionType={Transition.CROSSFADE} keymode={Keymode.ON_DEMAND}>
            <Event.Key onEscape={() => close()} />
            <box class="launcher" orientation={Orientation.VERTICAL}>
                <entry
                    text={TEXT}
                    onNotifyText={self => (TEXT_(self.text), self.set_position(-1))}
                    onActivate={() => {
                        const first = LIST().get()[0];
                        first && launch(first);
                    }}
                    $={self => ((entry = self), listen(open, o => o && self.grab_focus()))}
                />
                <scrolledwindow
                    hscrollbarPolicy={Policy.NEVER}
                    vscrollbarPolicy={Policy.EXTERNAL}
                    vadjustment={OFFSET()}
                    $={self => (view = self.child as Gtk.Viewport)}>
                    <box orientation={Orientation.VERTICAL}>
                        <For each={LIST()}>{app => item(app, entry, view)}</For>
                    </box>
                </scrolledwindow>
            </box>
        </Popup>
    );
};

export const open = () => (APPS().reload(), TEXT_(''), Closer.open('launcher')[1](true));

export const close = () => Closer.open('launcher')[1](false);
