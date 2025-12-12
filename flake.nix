{
  inputs = {
    ags = {
      url = "github:aylur/ags/v3.1.1";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, ags }: let
    systems = fn: nixpkgs.lib.mapAttrs (system: pkgs: fn pkgs (
      with pkgs.astal; ags.packages.${system}.default.override {
        inherit astal3 astal4;
        astal-io = io;
      }
    )) nixpkgs.legacyPackages;

    deps = pkgs: with pkgs.astal; builtins.concatLists (
      map (pkg: [ pkg ] ++ pkg.buildInputs) [
        astal4

        apps
        battery
        bluetooth
        hyprland
        mpris
        network
        notifd
        tray
        wireplumber
      ]
    );
  in {
    packages = systems (pkgs: ags: {
      default = pkgs.stdenv.mkDerivation {
        name = "shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          ags
          gobject-introspection
          wrapGAppsHook4
        ];

        buildInputs = deps pkgs;

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

    devShells = systems (pkgs: ags: {
      default = pkgs.mkShell {
        buildInputs = [ (ags.override { extraPackages = deps pkgs; }) ];
      };
    });
  };
}
