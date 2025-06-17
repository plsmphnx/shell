import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';

import { Props } from '../util';

function markup(value?: string) {
    return !!value && /<\/\w+>|&\w+;/.test(value);
}

function truncate(wrap?: boolean) {
    return wrap ? Ellipsize.NONE : Ellipsize.END;
}

export namespace Text {
    export type Props = Props.Label;
}
export const Text = ({ label, wrap, ...rest }: Text.Props) => (
    <label
        label={label}
        wrap={wrap}
        xalign={0}
        useMarkup={label instanceof Accessor ? label(markup) : markup(label)}
        ellipsize={wrap instanceof Accessor ? wrap(truncate) : truncate(wrap)}
        {...rest}
    />
);
export type Text = Gtk.Label;

export namespace Text {
    export namespace Box {
        export type Props = Props.Box;
    }
    export type Box = Gtk.ScrolledWindow;
}
Text.Box = ({ ...rest }: Text.Box.Props) => (
    <scrolledwindow
        hscrollbarPolicy={Policy.NEVER}
        vscrollbarPolicy={Policy.NEVER}
        hexpand
        propagateNaturalHeight>
        <box {...rest} />
    </scrolledwindow>
);
