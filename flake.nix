{
  inputs = {
    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    ags = {
      url = "github:aylur/ags/bbc3d04b271d2bfc5f357e688e014bce8dc7f0e2";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        astal.follows = "astal";
      };
    };
  };
  outputs = { self, nixpkgs, ags, astal }: let
    systems = fn: nixpkgs.lib.mapAttrs fn nixpkgs.legacyPackages;

    core = system: with astal.packages.${system}; [
      astal4
      io
    ];

    libs = system: with astal.packages.${system}; [
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
  in {
    packages = systems (system: pkgs: {
      default = pkgs.stdenv.mkDerivation {
        name = "shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          gobject-introspection
          ags.packages.${system}.default
        ];

        buildInputs = (core system) ++ (libs system);

        installPhase = ''
          runHook preInstall

          mkdir -p $out/bin
          ags bundle app.ts $out/bin/shell

          runHook postInstall
        '';
      };
    });

    devShells = systems (system: pkgs: {
      default = pkgs.mkShell {
        buildInputs = [
          (ags.packages.${system}.default.override { 
            extraPackages = libs system;
          })
        ];
      };
    });
  };
}
