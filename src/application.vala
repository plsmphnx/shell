class Application: Astal.Application {
    public static Application instance;

    public override void request(string msg, SocketConnection conn) {
        AstalIO.write_sock.begin(
            conn,
            @"missing response implementation on $instance_name"
        );
    }

    public override void activate() {
        base.activate();

        var provider = new Gtk.CssProvider();
        provider.load_from_resource("com/github/plsmphnx/shell/style.css");
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );

        var hyprland = AstalHyprland.Hyprland.get_default();

        hyprland.monitor_added.connect((h, m) => {
            var win = new Bar(m);
            win.present();
        });

        foreach (var m in hyprland.monitors) {
            var win = new Bar(m);
            win.present();
        }
        this.hold();
    }

    construct {
        instance_name = "shell";
        try {
            acquire_socket();
        } catch (Error e) {
            printerr("%s", e.message);
        }
        instance = this;
    }
}
