import { bind } from 'astal';
import { Gdk } from 'astal/gtk3';
import Tray from 'gi://AstalTray';

import { onClick } from '../lib/util';
import { Lazy } from '../lib/widget';

const { NORTH, SOUTH } = Gdk.Gravity;

const tray = Tray.get_default();

export default () => {
    const lazy = new Lazy(item => {
        const menu = item.create_menu();
        return [
            item.id,
            <button
                tooltipMarkup={bind(item, 'tooltip_markup')}
                onClick={onClick(
                    (_, { x, y }) => item.activate(x, y),
                    (self, { x, y }) =>
                        menu
                            ? menu.popup_at_widget(self, SOUTH, NORTH, null)
                            : item.secondary_activate(x, y),
                )}
                onDestroy={() => menu?.destroy()}>
                <icon gIcon={bind(item, 'gicon')} />
            </button>,
        ];
    }, tray.get_items());
    const conn = [
        tray.connect('item-added', (_, id) => lazy.add(tray.get_item(id))),
        tray.connect('item-removed', (_, id) => lazy.del(id)),
    ];

    return <box onDestroy={() => conn.map(id => tray.disconnect(id))}>{lazy()}</box>;
};
