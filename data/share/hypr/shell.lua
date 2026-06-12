hl.layer_rule {
    match = { namespace = "shell-.*" },
    blur = true,
    blur_popups = true,
    ignore_alpha = 0.2,
    no_anim = true,
}
hl.layer_rule {
    match = { namespace = "shell-bar" },
    xray = true,
}
hl.layer_rule {
    match = { namespace = "shell-close" },
    blur = false,
}
on("config.reloaded", function ()
    hl.exec_cmd "systemctl --user start shell@reload"
end)
