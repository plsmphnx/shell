{
  inputs = {
    ags = {
      url = "github:aylur/ags/v3.1.1";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, ags }: let
    systems = fn: nixpkgs.lib.mapAttrs (system: pkgs: fn system pkgs (
      with pkgs.astal; ags.packages.${system}.default.override {
        inherit astal3 astal4;
        astal-io = io;
      }
    )) nixpkgs.legacyPackages;
  in {
    packages = systems (_: pkgs: ags: {
      default = pkgs.callPackage ./nix/package.nix { inherit ags; };
    });

    devShells = systems (system: pkgs: ags: {
      default = pkgs.callPackage ./nix/shell.nix {
        inherit ags;
        shell = self.packages.${system}.default;
      };
    });

    nixosModules.default = import ./nix/module.nix self;
  };
}
