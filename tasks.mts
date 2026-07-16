// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { deleteFoldersRecursive, copyFiles } from '@iobroker/build-tools';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyI18nFiles(): void {
    copyFiles(['src/i18n/*.json'], 'build/i18n/');
}

deleteFoldersRecursive(`${__dirname}/build`, ['.png']);
copyI18nFiles();
