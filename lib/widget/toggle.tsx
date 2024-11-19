import { Variable } from 'astal';

import Closer from './closer';
import Dropdown, { Props as DropdownProps } from './dropdown';
import Status, { Props as StatusProps } from './status';

export interface Props extends Omit<StatusProps, 'onPrimary'>, Omit<DropdownProps, 'reveal'> {}
export default ({ reveal, monitor, child, onReveal, onDestroy, ...rest }: Props) => {
    const open = Variable(false);
    const unsub = reveal?.subscribe(v => v || open.set(false));
    const window = { monitor, reveal: open() };

    const drop = (
        <Dropdown {...window} onReveal={onReveal}>
            {child}
        </Dropdown>
    );
    const close = <Closer {...window} onClose={() => open.set(false)} />;
    return (
        <Status
            {...rest}
            onPrimary={() => open.set(!open.get())}
            reveal={reveal}
            onDestroy={self => {
                if (typeof onDestroy === 'function') {
                    onDestroy(self);
                }
                unsub?.();
                drop.destroy();
                close.destroy();
            }}
        />
    );
};
