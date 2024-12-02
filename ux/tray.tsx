import { bind } from 'astal';
import { Gdk, Widget } from 'astal/gtk3';
import Tray from 'gi://AstalTray';

import { onClick } from '../lib/util';
import { Lazy } from '../lib/widget';

const { NORTH, SOUTH } = Gdk.Gravity;

const tray = Tray.get_default();

export default () => {
    const lazy = new Lazy(item => {
        const menu = item.create_menu();
        const open =
            menu && ((self: Widget.Button) => menu.popup_at_widget(self, SOUTH, NORTH, null));
        return [
            item.item_id,
            <button
                tooltipMarkup={bind(item, 'tooltip_markup')}
                {...onClick(
                    open && item.is_menu ? open : (_, { x, y }) => item.activate(x, y),
                    open ?? ((_, { x, y }) => item.secondary_activate(x, y)),
                )}
                onDestroy={() => menu?.destroy()}>
                <icon gIcon={bind(item, 'gicon')} />
            </button>,
        ] as const;
    }, tray.get_items());
    const conn = [
        tray.connect('item-added', (_, id) => lazy.add(tray.get_item(id))),
        tray.connect('item-removed', (_, id) => lazy.del(id)),
    ];

    return <box onDestroy={() => conn.map(id => tray.disconnect(id))}>{lazy()}</box>;
};
