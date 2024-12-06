{
  inputs.astal = {
    url = "github:aylur/astal";
    inputs.nixpkgs.follows = "nixpkgs";
  };
  outputs = { self, nixpkgs, astal }: {
    packages = nixpkgs.lib.mapAttrs (system: pkgs: {
      default = pkgs.stdenv.mkDerivation {
        name = "shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          blueprint-compiler
          libxml2
          pkg-config
          sass
          vala
          wrapGAppsHook
        ];

        buildInputs = with astal.packages.${system}; [
          astal4
          io

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

        installPhase = ''
          mkdir -p $out/bin
          mv shell $out/bin
        '';
      };
    }) nixpkgs.legacyPackages;
  };
}
