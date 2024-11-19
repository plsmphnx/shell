{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    ags = {
      url = "github:aylur/ags";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        astal.follows = "astal";
      };
    };
  };
  outputs = { self, nixpkgs, ags, astal }: let
    systems = fn: nixpkgs.lib.mapAttrs fn nixpkgs.legacyPackages;

    libs = pkgs: with pkgs; [
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
      default = ags.lib.bundle {
        name = "shell";
        src = ./.;

        inherit pkgs;
        extraPackages = libs astal.packages.${system};
      };
    });

    devShells = systems (system: pkgs: {
      default = pkgs.mkShell {
        buildInputs = [
          (ags.packages.${system}.default.override { 
            extraPackages = libs astal.packages.${system};
          })
        ];
      };
    });
  };
}
