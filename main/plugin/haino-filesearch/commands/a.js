const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');
const { getLinkFiles, findClosestMatch } = require('../../../shared/closest');

exports.run = (command, p, key) => {
    // Chemins complets des répertoires spécifiés
    const desktopPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');
    const linksPath = path.join(process.env.USERPROFILE || process.env.HOME, 'Links');
    const startMenuProgramsPath = path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs');
    const quickLaunchPath = path.join(process.env.APPDATA, 'Microsoft', 'Internet Explorer', 'Quick Launch', 'User Pinned', 'TaskBar');
    const startMenuPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu');

    const directories = [desktopPath, linksPath, startMenuProgramsPath, quickLaunchPath, startMenuPath];
    const linkFiles = [];

    directories.forEach(directory => {
        try {
            const files = fs.readdirSync(directory);
            files.forEach(file => {
                if (file.endsWith('.lnk')) {
                    linkFiles.push(path.join(directory, file));
                }
            });
        } catch (error) {
            console.error(`Erreur lors de la lecture du répertoire ${directory} : ${error}`);
        }
    });




    let string = command.trim().split(" ").slice(1).join(" ")

    // Utilisation :
    const closestMatch = findClosestMatch(string, linkFiles);
    console.log('Application la plus proche :', closestMatch);
    p.innerText = path.basename(closestMatch).replace('.lnk', '');

    if (key == "Enter") {
        ipcRenderer.send('url', `${closestMatch}`);
    }

};