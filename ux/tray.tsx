import { For } from 'ags';
import { Gtk } from 'ags/gtk4';

import Tray from 'gi://AstalTray';

import { bind, listen } from '../lib/sub';
import { Config } from '../lib/util';
import { Event } from '../lib/widget';

function item(item: Tray.TrayItem) {
    let menu: Gtk.PopoverMenu;
    return (
        <image
            gicon={bind(item, 'gicon')}
            pixelSize={Config.Size.Text}
            tooltipMarkup={bind(item, 'tooltip_markup')}>
            <Event.Click
                onLeft={(_, x, y) => (item.is_menu ? menu.popup() : item.activate(x, y))}
                onRight={() => menu.popup()}
            />
            <Gtk.PopoverMenu
                menuModel={bind(item, 'menu_model')}
                hasArrow={false}
                $={self => {
                    menu = self;
                    listen(bind(item, 'action_group'), ag =>
                        self.insert_action_group('dbusmenu', ag),
                    );
                }}
            />
        </image>
    );
}

export default () => (
    <box>
        <For each={bind(Tray.get_default(), 'items')}>{item}</For>
    </box>
);
