{
  inputs = {
    ags = {
      url = "github:aylur/ags/v3.0.0";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, ags }: let
    systems = fn: nixpkgs.lib.mapAttrs fn nixpkgs.legacyPackages;

    core = pkgs: with pkgs.astal; [ astal4 ];

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

    ags_3 = system: pkgs: with pkgs; with astal;
      ags.packages.${system}.default.override {
        inherit astal3 astal4;
        astal-io = io;
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

        buildInputs = builtins.concatLists (
          map (pkg: [ pkg ] ++ pkg.buildInputs) ((core pkgs) ++ (libs pkgs))
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
