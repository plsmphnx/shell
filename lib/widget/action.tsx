import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import { compute, state } from '../sub';
import { Props } from '../util';

import * as Event from './event';

export namespace Action {
    export type Props = Props.Box & {
        actions?: [string | Accessor<string>, () => void, Accessor<boolean>?][];
    };
}
export const Action = ({ actions = [], ...rest }: Action.Props) => {
    if (actions.length === 0) {
        return <box {...rest} class="action" />;
    }

    const [hover, hover_] = state(false);
    const visible = actions.some(([, , v]) => !v)
        ? hover
        : compute(
              actions.map(([, , v]) => v!).concat(hover),
              (...v) => v.pop()! && v.some(v => v),
          );

    return (
        <box class="action" orientation={Orientation.VERTICAL}>
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
