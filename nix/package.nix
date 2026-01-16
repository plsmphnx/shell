{
  ags,
  astal,
  gobject-introspection,
  libgudev,
  stdenv,
  wrapGAppsHook4
}: stdenv.mkDerivation {
  name = "shell";
  src = ../.;

  nativeBuildInputs = [
    ags
    gobject-introspection
    wrapGAppsHook4
  ];

  buildInputs = with astal; builtins.concatLists (
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

      libgudev
    ]
  );

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
}
