import { Gtk, Widget } from 'astal/gtk3';

export function scrollIntoView(scroll: Widget.Scrollable, widget: Gtk.Widget) {
    const m = scroll.get_style_context().get_margin(scroll.get_state_flags());
    const y = widget.translate_coordinates(scroll, 0, 0)[2] - m.top;
    const w = widget.get_allocated_height();
    const s = scroll.get_allocated_height() - (m.top + m.bottom);
    if (y + w > s) {
        scroll.vadjustment.value += y + w - s;
    } else if (y < 0) {
        scroll.vadjustment.value += y;
    }
}
