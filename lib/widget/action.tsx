import { Binding, Variable } from 'astal';
import { Gtk, hook, Widget } from 'astal/gtk4';

import { join } from '../sub';

export interface Props extends Omit<Widget.BoxProps, 'children' | 'vertical'> {
    actions: [string | Binding<string>, () => unknown, Binding<boolean>?][];
}
export default ({ actions, child, cssClasses, ...rest }: Props) => {
    cssClasses =
        cssClasses instanceof Binding
            ? cssClasses.as(css => css.concat('action'))
            : (cssClasses || []).concat('action');

    if (actions.length === 0) {
        return (
            <box {...rest} cssClasses={cssClasses}>
                {child}
            </box>
        );
    }

    const hovered = Variable(false);
    const visible = join(
        ...actions
            .map(([, , v]) => v)
            .filter(v => !!v)
            .concat(hovered()),
    ).as((...v) => !!v.pop() && (v.some(v => v) || v.length === 0));

    return (
        <box
            {...rest}
            cssClasses={cssClasses}
            vertical
            setup={self => {
                const evt = new Gtk.EventControllerMotion();
                hook(self, evt, 'enter', () => hovered.set(true));
                hook(self, evt, 'leave', () => hovered.set(false));
                self.add_controller(evt);
            }}>
            {child}
            <revealer revealChild={visible} transitionType={Transition.SLIDE_DOWN}>
                <box cssClasses={['actions']}>
                    {actions.map(([l, c, v]) => (
                        <button label={l} onClicked={c} visible={v ?? true} hexpand />
                    ))}
                </box>
            </revealer>
        </box>
    );
};
