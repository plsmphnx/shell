import { Astal, Gtk } from 'astal/gtk3';

declare global {
    const Exclusivity: typeof Astal.Exclusivity;
    const Keymode: typeof Astal.Keymode;
    const Layer: typeof Astal.Layer;
    const Mouse: typeof Astal.MouseButton;
    const Anchor: typeof Astal.WindowAnchor;

    const START: Gtk.Align.START;
    const CENTER: Gtk.Align.CENTER;
    const END: Gtk.Align.END;
    const FILL: Gtk.Align.FILL;

    const ALWAYS: Gtk.PolicyType.ALWAYS;
    const AUTOMATIC: Gtk.PolicyType.AUTOMATIC;
    const NEVER: Gtk.PolicyType.NEVER;
    const EXTERNAL: Gtk.PolicyType.EXTERNAL;

    const NONE: Gtk.RevealerTransitionType.NONE;
    const CROSSFADE: Gtk.RevealerTransitionType.CROSSFADE;
    const SLIDE_RIGHT: Gtk.RevealerTransitionType.SLIDE_RIGHT;
    const SLIDE_LEFT: Gtk.RevealerTransitionType.SLIDE_LEFT;
    const SLIDE_UP: Gtk.RevealerTransitionType.SLIDE_UP;
    const SLIDE_DOWN: Gtk.RevealerTransitionType.SLIDE_DOWN;
}

Object.assign(globalThis, {
    Exclusivity: Astal.Exclusivity,
    Keymode: Astal.Keymode,
    Layer: Astal.Layer,
    Mouse: Astal.MouseButton,
    Anchor: Astal.WindowAnchor,
    ...Gtk.Align,
    ...Gtk.PolicyType,
    ...Gtk.RevealerTransitionType,
});
