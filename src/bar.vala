[GtkTemplate(ui = "/com/github/plsmphnx/shell/ui/bar.ui")]
public class Bar: Astal.Window {
    public AstalHyprland.Monitor monitor { get; private set; }

    public Bar(AstalHyprland.Monitor monitor) {
        Object(
            application: Application.instance, 
            namespace: "bar",
            anchor: Astal.WindowAnchor.LEFT
                  | Astal.WindowAnchor.RIGHT
                  | Astal.WindowAnchor.TOP
        );

        this.monitor = monitor;

        var ms = Gdk.Display.get_default().get_monitors();
        for (int i = 0; i < ms.get_n_items(); i++) {
            var m = ms.get_item(i) as Gdk.Monitor;
            if (m.connector == monitor.name) {
                GtkLayerShell.set_monitor(this, m);
                break;
            }
        }
    }
}
