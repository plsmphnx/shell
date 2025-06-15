import { Astal, Gtk } from 'ags/gtk4';
import Pango from 'gi://Pango';

declare global {
    const Exclusivity: typeof Astal.Exclusivity;
    const Keymode: typeof Astal.Keymode;
    const Layer: typeof Astal.Layer;
    const Anchor: typeof Astal.WindowAnchor;

    const Align: typeof Gtk.Align;
    const Orientation: typeof Gtk.Orientation;
    const Policy: typeof Gtk.PolicyType;
    const Transition: typeof Gtk.RevealerTransitionType;

    const Ellipsize: typeof Pango.EllipsizeMode;
}

Object.assign(globalThis, {
    Exclusivity: Astal.Exclusivity,
    Keymode: Astal.Keymode,
    Layer: Astal.Layer,
    Anchor: Astal.WindowAnchor,

    Align: Gtk.Align,
    Orientation: Gtk.Orientation,
    Policy: Gtk.PolicyType,
    Transition: Gtk.RevealerTransitionType,

    Ellipsize: Pango.EllipsizeMode,
});
