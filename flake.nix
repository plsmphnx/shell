{
  inputs = {
    ags = {
      url = "github:aylur/ags/v3.1.2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, ags, astal }: let
    systems = fn: nixpkgs.lib.mapAttrs (system: pkgs: fn pkgs
      ags.packages.${system}.default
      astal.packages.${system}
    ) nixpkgs.legacyPackages;

    core = ags: astal: with astal; ags.override {
      inherit astal3 astal4;
      astal-io = io;
    };

    deps = astal: with astal; builtins.concatLists (
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
    packages = systems (pkgs: ags: astal: let
      build = astal: pkgs.stdenv.mkDerivation {
        name = "shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          (core ags astal)
          gobject-introspection
          wrapGAppsHook4
        ];

        buildInputs = deps astal;

        dontWrapGApps = true;
        dontPatchShebangs = true;

        installPhase = ''
          runHook preInstall

          cp -r data $out
          substituteInPlace $(find $out -type f) \
            --replace-quiet /usr/bin $out/bin
          ags bundle app.ts $out/bin/shell

          runHook postInstall
        '';

        postFixup = ''
          wrapGApp $out/bin/shell
        '';
      };
    in {
      default = build pkgs.astal;
      flake = build astal;
    });

    devShells = systems (pkgs: ags: astal: let
      build = astal: pkgs.mkShell {
        buildInputs = with pkgs; [
          ((core ags astal).override { extraPackages = deps astal; })
          prettier
        ];
      };
    in {
      default = build pkgs.astal;
      flake = build astal;
    });

    nixosModules.default = { config, lib, pkgs, ... }: let
      cfg = config.programs.shell;
      sys = self.packages.${pkgs.stdenv.hostPlatform.system};
      pkg = flake: if flake then sys.flake else sys.default;
    in with lib; {
      options.programs.shell = {
        enable = mkEnableOption "the shell";
        flake = mkEnableOption "the astal flake";
      };

      config = mkIf cfg.enable {
        environment = {
          systemPackages = [ (pkg cfg.flake) ];
          pathsToLink = [ "/share/hypr" ];
        };

        systemd = {
          packages = [ (pkg cfg.flake) ];
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
