import { Binding } from 'astal';
import { Astal, Widget } from 'astal/gtk3';

import { onClick } from '../util';

export interface Props extends Omit<Widget.ButtonProps, 'child'> {
    reveal?: Binding<boolean>;
    onPrimary?: ((obj: Widget.Button, evt: Astal.ClickEvent) => unknown) | string;
    onSecondary?: ((obj: Widget.Button, evt: Astal.ClickEvent) => unknown) | string;
}

export default ({ reveal, onPrimary, onSecondary, ...rest }: Props) =>
    reveal ? (
        <revealer revealChild={reveal} transitionType={SLIDE_LEFT} transitionDuration={500}>
            <button {...rest} onClick={onClick(onPrimary, onSecondary)} />
        </revealer>
    ) : (
        <button {...rest} onClick={onClick(onPrimary, onSecondary)} />
    );
