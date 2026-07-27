{
  inputs = {
    ags = {
      url = "github:aylur/ags/v3.1.2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, ags }: let
    systems = fn: nixpkgs.lib.mapAttrs fn nixpkgs.legacyPackages;

    core = system: astal: with astal; ags.packages.${system}.default.override {
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
    packages = systems (system: pkgs: {
      default = pkgs.callPackage ({
        astal,
        gobject-introspection,
        stdenvNoCC,
        wrapGAppsHook4,
        ...
      }: stdenvNoCC.mkDerivation {
        name = "shell";
        src = ./.;

        nativeBuildInputs = [
          (core system astal)
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
      }) {};
    });

    devShells = systems (system: pkgs: {
      default = pkgs.callPackage ({
        astal,
        mkShell,
        ...
      }: mkShell {
        buildInputs = with pkgs; [
          ((core system astal).override { extraPackages = deps astal; })
          prettier
        ];
      }) {};
    });

    nixosModules.default = { config, lib, pkgs, ... }: let
      cfg = config.programs.shell;
      pkg = self.packages.${pkgs.stdenv.hostPlatform.system}.default.override {
        astal = cfg.astal;
      };
    in with lib; {
      options.programs.shell = {
        enable = mkEnableOption "the shell";
        astal = mkOption {
          type = types.attrsOf types.package;
          default = pkgs.astal;
          description = "Astal packages.";
        };
      };

      config = mkIf cfg.enable {
        environment = {
          systemPackages = [ pkg ];
          pathsToLink = [ "/share/hypr" ];
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
