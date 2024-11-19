import { execAsync } from 'astal';
import { Astal, Gdk, Gtk, Widget } from 'astal/gtk3';
import Hyprland from 'gi://AstalHyprland';

export type Select<T, U> = {
    [P in keyof T as T[P] extends U | undefined ? P : never]: T[P];
};

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

export function onClick<T extends Gtk.Widget>(
    primary?: ((obj: T, evt: Astal.ClickEvent) => unknown) | string,
    secondary?: ((obj: T, evt: Astal.ClickEvent) => unknown) | string,
) {
    const p = typeof primary === 'string' ? () => execAsync(primary) : primary || (() => {});
    const s =
        typeof secondary === 'string' ? () => execAsync(secondary) : secondary || (() => {});
    return (obj: T, evt: Astal.ClickEvent): unknown => {
        switch (evt.button) {
            case Mouse.PRIMARY:
                return p(obj, evt);
            case Mouse.SECONDARY:
                return s(obj, evt);
        }
    };
}

export function onKey<T extends Gtk.Widget>(keys: {
    [key: string]: (obj: T, evt: Gdk.Event) => unknown;
}) {
    return (obj: T, evt: Gdk.Event): unknown =>
        keys[Gdk.keyval_name(evt.get_keyval()[1]) || '']?.(obj, evt);
}

export namespace Monitor {
    export interface Props {
        monitor: {
            g: Gdk.Monitor;
            h: Hyprland.Monitor;
        };
    }

    export function resolve({ monitors }: Hyprland.Hyprland, g: Gdk.Monitor): Props {
        for (const h of monitors) {
            if (g.display.get_monitor_at_point(h.x, h.y) === g) {
                return { monitor: { g, h } };
            }
        }
        return undefined as any;
    }
}

export function opt<T, K extends keyof T>(k: K, v?: T[K]): Partial<T> {
    return v != null ? ({ [k]: v } as T) : {};
}
