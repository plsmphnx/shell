{ ags, mkShell, prettier, shell }: mkShell {
  buildInputs = [
    (ags.override { extraPackages = shell.buildInputs; })
    prettier
  ];
}
