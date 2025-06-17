import { For, Fragment, State } from 'ags';
import { Gtk } from 'ags/gtk4';

import Apps from 'gi://AstalApps';
import Gio from 'gi://Gio';

import { compute, listen, state } from '../lib/sub';
import { Event, Props, Static } from '../lib/util';
import { Closer, Icon, Text, Popup } from '../lib/widget';

const ICONS = {
    More: '\u{f0142}',
    Less: '\u{f0140}',
};

const OPEN = Static(() => state(false));

const TEXT = Static(() => state(''));

const APPS = Static(() => OPEN()[0](o => (o ? new Apps.Apps({ min_score: 0.5 }) : undefined)));

const LIST = Static(() => compute([APPS(), TEXT()[0]], (a, t) => a?.exact_query(t) || []));

const OFFSET = Static(() => new Gtk.Adjustment());

const DROP = Symbol();

const item = (app: Apps.Application, entry: Gtk.Entry, view: Gtk.Viewport) => {
    const Enter = () => (
        <Gtk.EventControllerMotion $enter={e => !entry.is_focus && e.widget.grab_focus()} />
    );
    type Actions = { open: () => unknown; close: () => unknown; toggle: () => unknown };
    const Primary = ({ actions, children }: Props.Button & { actions?: Actions }) => (
        <button>
            <Event.Click $left={launch} $right={actions?.toggle} />
            <Event.Key $return={launch} $right={actions?.open} $left={actions?.close} />
            <Enter />
            <box>
                <Icon from={app} icon={[{ icon: 'icon_name' }]} />
                <Text label={app.name} />
                <Fragment>{children}</Fragment>
            </box>
        </button>
    );
    const launch = () => (close(), app.launch());

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
                    <Text class="actions" label={show(s => (s ? ICONS.Less : ICONS.More))} />
                </Primary>
                <revealer
                    revealChild={show}
                    transitionType={Transition.SLIDE_DOWN}
                    $$childRevealed={self =>
                        view.scroll_to(self.child_revealed ? secondary : primary, null)
                    }>
                    <box orientation={Orientation.VERTICAL}>
                        {list.map(a => {
                            const action = () => (close(), info.launch_action(a, null));
                            return (
                                <button $={self => (secondary = self)}>
                                    <Event.Click $left={action} />
                                    <Event.Key $return={action} $left={close} />
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
    const [open] = OPEN();
    const [text, text_] = TEXT();

    let entry: Gtk.Entry;
    let view: Gtk.Viewport;

    <Closer visible={open} $close={() => close()} />;

    return (
        <Popup visible={open} transitionType={Transition.CROSSFADE} keymode={Keymode.ON_DEMAND}>
            <Event.Key $escape={() => close()} />
            <box class="launcher" orientation={Orientation.VERTICAL}>
                <entry
                    text={text}
                    $$text={self => (text_(self.text), self.set_position(-1))}
                    $activate={() => (close(), LIST().get()[0]?.launch())}
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

export const open = () => (TEXT()[1](''), OPEN()[1](true));

export const close = () => OPEN()[1](false);
