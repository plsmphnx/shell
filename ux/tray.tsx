import { bind } from 'astal';
import { Gdk, Gtk, Widget } from 'astal/gtk3';
import Tray from 'gi://AstalTray';

import { Event } from '../lib/util';
import { Lazy } from '../lib/widget';

const { NORTH, SOUTH } = Gdk.Gravity;

export default () => {
    const tray = Tray.get_default();

    const lazy = new Lazy(item => {
        const menu = Gtk.Menu.new_from_model(item.menu_model);
        menu.insert_action_group('dbusmenu', item.action_group);
        const open = (self: Widget.Button) => menu.popup_at_widget(self, SOUTH, NORTH, null);
        return [
            item.item_id,
            <button
                tooltipMarkup={bind(item, 'tooltip_markup')}
                {...Event.click(
                    item.is_menu ? open : (_, { x, y }) => item.activate(x, y),
                    open,
                )}
                onDestroy={() => menu.destroy()}>
                <icon gicon={bind(item, 'gicon')} />
            </button>,
        ] as const;
    }, tray.get_items());
    const conn = [
        tray.connect('item-added', (_, id) => lazy.add(tray.get_item(id))),
        tray.connect('item-removed', (_, id) => lazy.del(id)),
    ];

    return (
        <box onDestroy={() => conn.map(id => tray.disconnect(id))} noImplicitDestroy={true}>
            {lazy()}
        </box>
    );
};
