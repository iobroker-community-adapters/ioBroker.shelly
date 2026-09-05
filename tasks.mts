// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { deleteFoldersRecursive, copyFiles, npmInstall, buildReact } from '@iobroker/build-tools';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcAdmin = `${__dirname}/src-admin/`;

function copyI18nFiles(): void {
    copyFiles(['src/i18n/*.json'], 'build/i18n/');
}

/** Copy the built admin custom components (module federation remote) into the admin folder. */
function copyAdminComponents(): void {
    copyFiles(['src-admin/build/customComponents.js'], 'admin/custom');
    copyFiles(['src-admin/build/assets/*'], 'admin/custom/assets');
    // The admin reads this manifest to see which component library the build was made against,
    // and refuses to start the component if it targets an older GUI API generation.
    copyFiles(['src-admin/build/mf-manifest.json'], 'admin/custom');
    copyFiles(['src-admin/src/i18n/*.json'], 'admin/custom/i18n');
}

if (process.argv.includes('--admin')) {
    // The result is committed, so this only has to run after a change in src-admin (npm run build:admin)
    if (existsSync(`${__dirname}/admin/custom`)) {
        deleteFoldersRecursive(`${__dirname}/admin/custom`);
    }
    if (existsSync(`${srcAdmin}build`)) {
        deleteFoldersRecursive(`${srcAdmin}build`);
    }
    npmInstall(srcAdmin)
        .then(() => buildReact(srcAdmin, { vite: true }))
        .then(() => copyAdminComponents())
        .catch((e: unknown) => {
            console.error(e);
            process.exit(2);
        });
} else {
    deleteFoldersRecursive(`${__dirname}/build`, ['.png']);
    copyI18nFiles();
}
