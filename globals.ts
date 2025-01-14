import { Astal, Gdk, Gtk } from 'astal/gtk4';
import Pango from 'gi://Pango';

declare global {
    const Exclusivity: typeof Astal.Exclusivity;
    const Keymode: typeof Astal.Keymode;
    const Layer: typeof Astal.Layer;
    const Anchor: typeof Astal.WindowAnchor;

    const Gravity: typeof Gdk.Gravity;

    const Align: typeof Gtk.Align;
    const Policy: typeof Gtk.PolicyType;
    const Transition: typeof Gtk.RevealerTransitionType;

    const Ellipsize: typeof Pango.EllipsizeMode;
}

Object.assign(globalThis, {
    Exclusivity: Astal.Exclusivity,
    Keymode: Astal.Keymode,
    Layer: Astal.Layer,
    Anchor: Astal.WindowAnchor,

    Gravity: Gdk.Gravity,

    Align: Gtk.Align,
    Policy: Gtk.PolicyType,
    Transition: Gtk.RevealerTransitionType,

    Ellipsize: Pango.EllipsizeMode,
});
