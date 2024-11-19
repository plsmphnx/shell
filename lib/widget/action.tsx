import { Binding, Variable } from 'astal';
import { Widget } from 'astal/gtk3';

import { join } from '../sub';

export interface Props extends Omit<Widget.BoxProps, 'children' | 'vertical'> {
    actions: [string | Binding<string>, () => unknown, Binding<boolean>?][];
}
export default ({ actions, child, className, ...rest }: Props) => {
    className = className ? `action ${className}` : 'action';

    if (actions.length === 0) {
        return (
            <box {...rest} className={className}>
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
    ).as((...v) => v.pop() && (v.some(v => v) || v.length === 0));

    return (
        <eventbox onHover={() => hovered.set(true)} onHoverLost={() => hovered.set(false)}>
            <box {...rest} className={className} vertical>
                {child}
                <revealer revealChild={visible} transitionType={SLIDE_DOWN}>
                    <box className="actions">
                        {actions.map(([l, c, v]) => (
                            <button label={l} onClicked={c} visible={v ?? true} hexpand />
                        ))}
                    </box>
                </revealer>
            </box>
        </eventbox>
    );
};
