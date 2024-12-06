shell: shell.xml $(wildcard src/*.vala) shell.c
	valac -o shell --gresources=shell.xml src/*.vala shell.c \
		--pkg gtk4                \
		--pkg gtk4-layer-shell-0  \
		--pkg astal-4-4.0         \
		--pkg astal-io-0.1        \
		--pkg astal-hyprland-0.1  \

shell.c: shell.xml
	glib-compile-resources --generate-source shell.xml

shell.xml: $(wildcard ui/*.ui) style.css
	./gresources shell.xml ui/*.ui style.css

ui/*.ui: $(wildcard src/*.blp)
	blueprint-compiler batch-compile ui src src/*.blp

style.css: style.scss
	scss -t compressed style.scss style.css
