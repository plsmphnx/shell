import { Fragment } from 'ags';

import { Props } from '../util';

// https://gitlab.gnome.org/GNOME/gtk/-/issues/7301
export const Workaround = ({ children }: Props.Box) => (
    <box orientation={Orientation.VERTICAL}>
        <Fragment>{children}</Fragment>
        <label css="color:transparent;font-size:0.01px;" label="-" />
    </box>
);
