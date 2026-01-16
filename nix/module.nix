self: { config, lib, pkgs, ... }: let
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
}
