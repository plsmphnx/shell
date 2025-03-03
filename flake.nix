{
  inputs = {
    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane.url = "github:ipetkov/crane";
  };
  outputs = { self, nixpkgs, astal, crane }: {
    packages = nixpkgs.lib.mapAttrs (system: pkgs: let
      tools = crane.mkLib pkgs;
      cargo = tools.appliedCargoNix {
        name = "shell";
        src = ./.;
      };
    in {
      default = tools.buildPackage {
        src = tools.cleanCargoSource ./.;
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
      };
    }) nixpkgs.legacyPackages;
  };
}
