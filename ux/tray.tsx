import { createBinding, createEffect, For } from 'ags';
import { Gtk } from 'ags/gtk4';

import Tray from 'gi://AstalTray';

import { Config, Static } from '../lib/util';
import { Event } from '../lib/widget';

function item(item: Tray.TrayItem) {
    let menu: Gtk.PopoverMenu;
    return (
        <image
            gicon={createBinding(item, 'gicon')}
            pixelSize={Config.Size.Text}
            tooltipMarkup={createBinding(item, 'tooltip_markup')}>
            <Event.Click
                onLeft={(_, x, y) => (item.is_menu ? menu.popup() : item.activate(x, y))}
                onRight={() => menu.popup()}
            />
            <Gtk.PopoverMenu
                menuModel={createBinding(item, 'menu_model')}
                hasArrow={false}
                $={self => {
                    menu = self;
                    const actionGroup = createBinding(item, 'action_group');
                    createEffect(() => self.insert_action_group('dbusmenu', actionGroup()));
                }}
            />
        </image>
    );
}

const ITEMS = Static(() =>
    createBinding(Tray.get_default(), 'items').as(is =>
        is.sort((a, b) => a.id.localeCompare(b.id)),
    ),
);

export default () => (
    <box>
        <For each={ITEMS()}>{item}</For>
    </box>
);
