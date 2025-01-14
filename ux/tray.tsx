import { bind } from 'astal';
import { Gtk } from 'astal/gtk4';
import Tray from 'gi://AstalTray';

import { Event } from '../lib/util';
import { Lazy } from '../lib/widget';

export default () => {
    const tray = Tray.get_default();

    const lazy = new Lazy(item => {
        const menu = Gtk.PopoverMenu.new_from_model(item.menu_model);
        menu.insert_action_group('dbusmenu', item.action_group);
        return [
            item.item_id,
            <button
                tooltipMarkup={bind(item, 'tooltip_markup')}
                {...Event.click(
                    item.is_menu
                        ? () => menu.popdown()
                        : (_, evt) => {
                              const [, x, y] = evt.get_position();
                              item.activate(x, y);
                          },
                    () => menu.popdown(),
                )}
                onDestroy={() => menu.run_dispose()}>
                <image gicon={bind(item, 'gicon')} />
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
