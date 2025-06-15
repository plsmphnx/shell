import { For, Fragment } from 'ags';
import { Gtk } from 'ags/gtk4';

import Apps from 'gi://AstalApps';
import Gio from 'gi://Gio';

import { state } from '../lib/sub';
import { Event, Props } from '../lib/util';
import { Closer, Icon, Text, Popup } from '../lib/widget';

const ICONS = {
    More: '\u{f0142}',
    Less: '\u{f0140}',
};

interface Context {
    close: () => unknown;
    entry: Gtk.Entry;
    view: Gtk.Viewport;
}

const item = (app: Apps.Application, ctx: Context) => {
    const Enter = () => (
        <Gtk.EventControllerMotion $enter={e => !ctx.entry.is_focus && e.widget.grab_focus()} />
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
    const launch = () => (ctx.close(), app.launch());

    const info = app.app as Gio.DesktopAppInfo;
    const list = info.list_actions();
    if (list.length > 0) {
        const [show, show_] = state(false);
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
                        ctx.view.scroll_to(self.child_revealed ? secondary : primary, null)
                    }>
                    <box orientation={Orientation.VERTICAL}>
                        {list.map(a => {
                            const action = () => (ctx.close(), info.launch_action(a, null));
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

export default (dispose: () => void) => {
    const apps = new Apps.Apps({ min_score: 0.5 });
    const [text, text_] = state('');
    const list = text(t => apps.exact_query(t));
    const [open, open_] = state(true);
    const ctx = { close: () => open_(false) } as Context;

    <Popup
        visible={open}
        transitionType={Transition.CROSSFADE}
        keymode={Keymode.ON_DEMAND}
        $$visible={self => (self.visible ? ctx.entry.grab_focus() : dispose())}>
        <Event.Key $escape={() => ctx.close()} />
        <box class="launcher" orientation={Orientation.VERTICAL}>
            <entry
                $changed={self => text_(self.text)}
                $activate={() => (ctx.close(), list.get()[0]?.launch())}
                $={self => (ctx.entry = self)}
            />
            <scrolledwindow
                hscrollbarPolicy={Policy.NEVER}
                vscrollbarPolicy={Policy.EXTERNAL}
                $={self => (ctx.view = self.child as Gtk.Viewport)}>
                <box orientation={Orientation.VERTICAL}>
                    <For each={list}>{app => item(app, ctx)}</For>
                </box>
            </scrolledwindow>
        </box>
    </Popup>;

    <Closer visible $close={() => ctx.close()} />;
};
