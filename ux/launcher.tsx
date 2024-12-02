import { Variable } from 'astal';
import { Gtk, Widget } from 'astal/gtk3';
import Apps from 'gi://AstalApps';
import Gio from 'gi://Gio';

import { onClick, onKey, scrollIntoView } from '../lib/util';
import { Closer } from '../lib/widget';

const ICONS = {
    More: '\u{f0142}',
    Less: '\u{f0140}',
};

interface Context {
    entry: Widget.Entry;
    scroll: Widget.Scrollable;
    window: Widget.Window;
}

const item = (app: Apps.Application, ctx: Context) => {
    const Text = (props: Widget.LabelProps) => (
        <label {...props} xalign={0} valign={CENTER} truncate />
    );
    const Button = (props: Widget.ButtonProps) => (
        <button
            {...props}
            onHover={self => !ctx.entry.is_focus && self.grab_focus()}
            onFocusInEvent={self => scrollIntoView(ctx.scroll, self)}
        />
    );
    const Primary = ({ child, ...rest }: Widget.ButtonProps) => (
        <Button {...rest}>
            <box>
                <icon className="icon" icon={app.icon_name || ''} />
                <Text label={app.name} />
                {child}
            </box>
        </Button>
    );
    const launch = () => {
        ctx.window.destroy();
        app.launch();
    };

    const desk = app.app as Gio.DesktopAppInfo;
    const list = desk.list_actions();
    if (list.length > 0) {
        const show = Variable(false);
        let primary: Gtk.Widget;

        const open = () => (primary.grab_focus(), show.set(true));
        const close = () => (primary.grab_focus(), show.set(false));
        const toggle = () => (primary.grab_focus(), show.set(!show.get()));

        primary = (
            <Primary
                onClick={onClick(launch, toggle)}
                onKeyPressEvent={onKey({ Return: launch, Right: open, Left: close })}>
                <Text className="actions" label={show(s => (s ? ICONS.Less : ICONS.More))} />
            </Primary>
        );

        return (
            <box vertical>
                {primary}
                <revealer revealChild={show()} transitionType={SLIDE_DOWN}>
                    <box vertical>
                        {list.map(a => {
                            const action = () => {
                                ctx.window.destroy();
                                desk.launch_action(a, null);
                            };
                            return (
                                <Button
                                    onClick={onClick(action, close)}
                                    onKeyPressEvent={onKey({ Return: action, Left: close })}>
                                    <Text label={desk.get_action_name(a) || a} />
                                </Button>
                            );
                        })}
                    </box>
                </revealer>
            </box>
        );
    } else {
        return <Primary onClick={launch} onKeyPressEvent={onKey({ Return: launch })} />;
    }
};

export default () => {
    const apps = new Apps.Apps({ min_score: 0.5 });
    const ctx = {} as Context;

    const text = Variable('');
    const list = text(t => apps.exact_query(t));

    const closer = <Closer onClose={() => ctx.window.destroy()} />;

    return (
        <window
            namespace="launcher"
            layer={Layer.OVERLAY}
            keymode={Keymode.EXCLUSIVE}
            onKeyPressEvent={onKey({ Escape: () => ctx.window.destroy() })}
            onDestroy={() => closer.destroy()}
            setup={self => (ctx.window = self)}>
            <box className="launcher" vertical>
                <entry
                    hexpand
                    onChanged={self => text.set(self.text)}
                    onActivate={() => {
                        ctx.window.destroy();
                        list.get()[0]?.launch();
                    }}
                    setup={self => (ctx.entry = self)}
                />
                <scrollable
                    hscroll={NEVER}
                    vscroll={EXTERNAL}
                    setup={self => (ctx.scroll = self)}>
                    <box vertical>{list.as(apps => apps.map(app => item(app, ctx)))}</box>
                </scrollable>
            </box>
        </window>
    );
};
