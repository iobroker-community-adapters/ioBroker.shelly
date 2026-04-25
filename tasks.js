// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { deleteFoldersRecursive, buildReact, copyFiles, npmInstall } = require('@iobroker/build-tools');

function copyI18nFiles() {
    copyFiles(['src/lib/i18n/*.json'], 'build/lib/i18n/');
}

deleteFoldersRecursive(`${__dirname}/build`, ['.png']);
copyI18nFiles();
