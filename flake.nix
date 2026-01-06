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

        dontWrapGApps = true;
        dontPatchShebangs = true;

        installPhase = ''
          runHook preInstall

          cp -r data $out
          substituteInPlace $(find $out -type f) --replace /usr/bin $out/bin
          ags bundle app.ts $out/bin/shell

          runHook postInstall
        '';

        postFixup = ''
          wrapGApp $out/bin/shell
        '';
      };
    });

    devShells = systems (pkgs: ags: {
      default = pkgs.mkShell {
        buildInputs = with pkgs; [
          (ags.override { extraPackages = deps pkgs; })
          prettier
        ];
      };
    });

    nixosModules.default = { config, lib, pkgs, ... }: let
      cfg = config.programs.shell;
      pkg = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
    in with lib; {
      options.programs.shell.enable = mkEnableOption "the shell";

      config = mkIf cfg.enable {
        environment = {
          systemPackages = [ pkg ];
          pathsToLink = [ "/share/shell" ];
        };

        systemd = {
          packages = [ pkg ];
          user.services.shell = {
            environment.PATH = mkForce (concatStringsSep ":" [
              "/run/wrappers/bin"
              "/run/current-system/sw/bin"
              "%h/.nix-profile/bin"
            ]);
            wantedBy = [ "graphical-session.target" ];
          };
        };
      };
    };
  };
}
