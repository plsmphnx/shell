import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import { compute, state } from '../sub';
import { Props } from '../util';

export namespace Action {
    export type Props = Props.Box & {
        actions?: [string | Accessor<string>, () => unknown, Accessor<boolean>?][];
    };
}
export const Action = ({ actions = [], ...rest }: Action.Props) => {
    if (actions.length === 0) {
        return <box {...rest} class="action" />;
    }

    const [hovered, hovered_] = state(false);
    const visible = actions.some(([, , v]) => !v)
        ? hovered
        : compute(actions.map(([, , v]) => v!).concat(hovered))(
              v => v.pop()! && v.some(v => v),
          );

    return (
        <box class="action" orientation={Orientation.VERTICAL}>
            <Gtk.EventControllerMotion
                $enter={() => hovered_(true)}
                $leave={() => hovered_(false)}
            />
            <box {...rest} />
            <revealer revealChild={visible} transitionType={Transition.SLIDE_DOWN}>
                <box class="actions" homogeneous>
                    {actions.map(([l, c, v]) => (
                        <button label={l} $clicked={c} visible={v ?? true} />
                    ))}
                </box>
            </revealer>
        </box>
    );
};
