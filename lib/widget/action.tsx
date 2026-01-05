import { Accessor, createComputed, createState } from 'ags';
import { Gtk } from 'ags/gtk4';

import { Props } from '../util';

import * as Event from './event';

export namespace Action {
    export type Props = Props.Box & {
        actions?: [string | Accessor<string>, () => void, Accessor<boolean>?][];
    };
}
export const Action = ({ actions = [], class: cls, ...rest }: Action.Props) => {
    if (actions.length === 0) {
        return <box class={cls} {...rest} $={self => self.add_css_class('action')} />;
    }

    const [hover, hover_] = createState(false);
    const visible = actions.some(([, , v]) => !v)
        ? hover
        : createComputed(() => hover() && actions.some(([, , v]) => v!()));

    return (
        <box
            class={cls}
            $={self => self.add_css_class('action')}
            orientation={Orientation.VERTICAL}>
            <Event.Hover onHover={(_, h) => hover_(h)} />
            <box {...rest} />
            <revealer revealChild={visible} transitionType={Transition.SLIDE_DOWN}>
                <box class="actions" homogeneous>
                    {actions.map(([l, c, v]) => (
                        <button label={l} onClicked={c} visible={v ?? true} />
                    ))}
                </box>
            </revealer>
        </box>
    );
};
export type Action = Gtk.Box;
