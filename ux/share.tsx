import { createBinding, createMemo, createState } from 'ags';

import Hyprland from 'gi://AstalHyprland';

import { Icon, Monitor, Static } from '../lib/util';
import { Action, Event, Popup } from '../lib/widget';

const ICONS = {
    Label: '\u{f06d0}',
    Screen: '\u{f0379}',
};

const [INFO, INFO_] = createState<{
    win: { [addr: string]: string };
    res: (res: any) => void;
} | void>(undefined);

const FOCUSED = Static(() => {
    const focused = createBinding(Hyprland.get_default(), 'focused_client');
    return createMemo(() =>
        INFO() && focused()
            ? {
                  icon: Icon.client(focused())(),
                  id: INFO()!.win[createBinding(focused(), 'address')()],
              }
            : {},
    );
});

export default () => {
    const { gdk } = Monitor.Context.use();
    return (
        <Popup visible={INFO.as(i => !!i)} anchor={Anchor.TOP} transitionDuration={1000}>
            <Action
                class="iconic"
                halign={Align.CENTER}
                actions={[
                    [ICONS.Screen, () => close('screen', gdk.connector)],
                    [
                        FOCUSED().as(({ icon }) => icon || ''),
                        () => close('window', FOCUSED().peek().id),
                        FOCUSED().as(({ id }) => !!id),
                    ],
                ]}>
                <Event.Click onRight={() => close()} />
                <label class="iconic" label={ICONS.Label} />
            </Action>
        </Popup>
    );
};

export function open(req: string[], res: (res: any) => void) {
    const win: { [addr: string]: string } = {};
    for (const [_, id, addr] of req.join().matchAll(/(\d+)\[HC>\].*?(\d+)\[HA>\]/g)) {
        if (addr) {
            win[Number(addr).toString(16)] = id;
        }
    }
    INFO_({ win, res });
}

function close(type = '', value?: any) {
    INFO_(i => i?.res(type && `[SELECTION]r/${type}:${value}`));
}
