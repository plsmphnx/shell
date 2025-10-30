{
  inputs = {
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, ags }: let
    systems = fn: nixpkgs.lib.mapAttrs fn nixpkgs.legacyPackages;

    core = pkgs: with pkgs.astal; [ astal4 io ];

    libs = pkgs: with pkgs.astal; [
      apps
      battery
      bluetooth
      hyprland
      mpris
      network
      notifd
      tray
      wireplumber
    ];

    ags_3 = system: pkgs: with pkgs; ags.packages.${system}.default.override {
      astal3 = astal.astal3;
      astal4 = astal.astal4;
      astal-io = astal.io;
      wrapGAppsHook = wrapGAppsHook4;
    };
  in {
    packages = systems (system: pkgs: {
      default = pkgs.stdenv.mkDerivation {
        name = "shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook4
          gobject-introspection
          (ags_3 system pkgs)
        ];

        buildInputs = with builtins; (core pkgs) ++ (libs pkgs) ++ (
          foldl' (a: b: a ++ b) [] (map (pkg: pkg.buildInputs) (libs pkgs))
        );

        installPhase = ''
          runHook preInstall

          mkdir -p $out/bin
          ags bundle app.ts $out/bin/shell
          cp -r etc $out/etc
          substituteInPlace $out/etc/systemd/user/*.service \
            --replace /usr/bin/shell $out/bin/shell

          runHook postInstall
        '';
      };
    });

    devShells = systems (system: pkgs: {
      default = pkgs.mkShell {
        buildInputs = [
          ((ags_3 system pkgs).override { extraPackages = libs pkgs; })
        ];
      };
    });
  };
}
