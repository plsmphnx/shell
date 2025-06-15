import { For } from 'ags';
import { Gtk } from 'ags/gtk4';

import Tray from 'gi://AstalTray';

import { bind, listen } from '../lib/sub';
import { Event } from '../lib/util';

function item(item: Tray.TrayItem) {
    const menu = Gtk.PopoverMenu.new_from_model(item.menu_model);
    listen(bind(item, 'action_group'), ag => menu.insert_action_group('dbusmenu', ag));
    return (
        <image gicon={bind(item, 'gicon')} tooltipMarkup={bind(item, 'tooltip_markup')}>
            <Event.Click
                $left={item.is_menu ? () => menu.popup() : (_, x, y) => item.activate(x, y)}
                $right={() => menu.popup()}
            />
            {menu}
        </image>
    );
}

export default () => (
    <box>
        <For each={bind(Tray.get_default(), 'items')}>{item}</For>
    </box>
);
