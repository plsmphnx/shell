[GtkTemplate(ui = "/com/github/plsmphnx/shell/ui/title.ui")]
public class Title: Gtk.Button {
    public AstalHyprland.Hyprland hyprland { get; private set; }

    construct {
        hyprland = AstalHyprland.Hyprland.get_default();
    }
}