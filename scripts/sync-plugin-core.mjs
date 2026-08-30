#!/usr/bin/env node

/* Each harness adapter must be self-contained after a marketplace or a package
   manager installs only its directory. These files are generated mirrors, never
   a second implementation. Add a target here rather than forking the core. */

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "extensions", "lib");
const targets = [
  join(root, "plugins", "pi-canon", "core"),
  join(root, "dsh-canon", "src", "core"),
];
const files = ["lint.ts", "retrieval.ts", "schema.ts", "store.ts", "surfacing.ts", "tool.ts"];

for (const target of targets) {
  mkdirSync(target, { recursive: true });
  for (const file of files) copyFileSync(join(source, file), join(target, file));
  console.log(`Synced ${files.length} canonical core files into ${target.slice(root.length + 1)}.`);
}
