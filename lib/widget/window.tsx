import { onCleanup } from 'ags';
import { Astal } from 'ags/gtk4';

import { Monitor, Props } from '../util';

export namespace Window {
    export type Props = Props.Window & {
        kind: string;
    };
}
export const Window = ({ kind, ...rest }: Window.Props) => (
    <Astal.Window
        namespace={`shell-${kind}`}
        gdkmonitor={Monitor.Context.use()?.gdk}
        $={self => onCleanup(() => self.run_dispose())}
        {...rest}
    />
);
export type Window = Astal.Window;
