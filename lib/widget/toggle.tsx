import { Accessor } from 'ags';

import { compute, listen } from '../sub';

import { Closer } from './closer';
import { Popup } from './popup';
import { Status } from './status';

export namespace Toggle {
    export type Props = Omit<Status.Props, 'onPrimary'> & {
        id: string;
        drop?: Accessor<boolean>;
    };
}
export const Toggle = ({ id, visible, drop, children, ...rest }: Toggle.Props) => {
    const [open, open_] = Closer.open(id);
    listen(visible, v => v || open_(false));

    <Popup
        visible={drop ? compute([open, drop], (o, d) => o || d) : open}
        transitionType={Transition.SLIDE_DOWN}
        transitionDuration={1000}
        anchor={Anchor.TOP | Anchor.RIGHT}>
        {children}
    </Popup>;

    return (
        <Status
            onPrimary={() => open_(o => !o)}
            visible={visible}
            class={open.as(o => (o ? 'bright' : ''))}
            {...rest}
        />
    );
};
export type Toggle = Status;

Toggle.open = (id: string) => Closer.open(id)[0];
