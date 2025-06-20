import { State } from 'ags';

import { compute, reduce, state } from '../sub';
import { Static } from '../util';

import * as Event from './event';
import { Window } from './window';
import { Workaround } from './workaround';

const [OPEN, OPEN_] = state<{ [id: string]: State<boolean> }>({});

const ANY = Static(() =>
    reduce(
        OPEN.as(o =>
            compute(
                Object.values(o).map(o => o[0]),
                (...o) => o.some(o => o),
            ),
        ),
    ),
);

export const Closer = () => (
    <Window
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT | Anchor.BOTTOM}
        layer={Layer.TOP}
        keymode={Keymode.NONE}
        visible={ANY()}>
        <Event.Click
            onAny={() => {
                for (const [, open_] of Object.values(OPEN.get())) {
                    open_(false);
                }
            }}
        />
        <Workaround />
    </Window>
);
export type Closer = Window;

Closer.open = (id: string) => {
    OPEN_(o => (id in o ? o : { ...o, [id]: state(false) }));
    return OPEN.get()[id];
};
