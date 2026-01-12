import { createMemo, createState, State } from 'ags';

import { Static } from '../util';

import * as Event from './event';
import { Window } from './window';
import { Workaround } from './workaround';

const [OPEN, OPEN_] = createState<{ [id: string]: State<boolean> }>({});

const ANY = Static(() => createMemo(() => Object.values(OPEN()).some(([o]) => o())));

export const Closer = () => (
    <Window
        kind="close"
        anchor={Anchor.TOP | Anchor.RIGHT | Anchor.LEFT | Anchor.BOTTOM}
        layer={Layer.TOP}
        keymode={Keymode.NONE}
        visible={ANY()}>
        <Event.Click
            onAny={() => {
                for (const [, open_] of Object.values(OPEN.peek())) {
                    open_(false);
                }
            }}
        />
        <Workaround />
    </Window>
);
export type Closer = Window;

Closer.open = (id: string) => {
    OPEN_(o => (id in o ? o : { ...o, [id]: createState(false) }));
    return OPEN.peek()[id];
};
