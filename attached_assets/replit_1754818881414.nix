
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
    pkgs.nodePackages.npm
    pkgs.nodePackages.concurrently
  ];
}
