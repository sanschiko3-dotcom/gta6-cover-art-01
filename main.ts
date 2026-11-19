// Vice Cover Studio v2 packages the offline editor and captures; PNG export is verified at all three post ratios.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repository = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
mkdirSync(output, { recursive: true });
cpSync(join(repository, 'app'), join(output, 'app'), { recursive: true, force: true });
cpSync(join(repository, 'screenshots'), join(output, 'screenshots'), { recursive: true, force: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648
});
writeFileSync(join(output, 'dossier.json'), dossier);
