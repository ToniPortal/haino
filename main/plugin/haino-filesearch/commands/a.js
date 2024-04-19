const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

exports.run = (command, p,key) => {
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


    function findClosestMatch(string, linkFiles) {
        let closestMatch = null;
        let maxCommonSubstringLength = -1;
    
        linkFiles.forEach(file => {
            // Extraire le nom du fichier sans l'extension
            const fileName = path.basename(file).replace('.lnk', '');
    
            // Calculer la longueur de la sous-chaîne la plus longue commune entre la chaîne de recherche et le nom du fichier
            const commonSubstringLength = longestCommonSubstring(string.toLowerCase(), fileName.toLowerCase());
    
            // Si la longueur de la sous-chaîne la plus longue est supérieure à celle actuellement enregistrée, mettre à jour le résultat le plus proche
            if (commonSubstringLength > maxCommonSubstringLength) {
                maxCommonSubstringLength = commonSubstringLength;
                closestMatch = file;
            }
        });
    
        return closestMatch;
    }
    
    // Fonction pour calculer la longueur de la sous-chaîne la plus longue commune
    function longestCommonSubstring(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const matrix = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
        let maxCommonLength = 0;
    
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                    maxCommonLength = Math.max(maxCommonLength, matrix[i][j]);
                }
            }
        }
    
        return maxCommonLength;
    }



    let string = command.trim().split(" ").slice(1).join(" ")

    // Utilisation :
    const closestMatch = findClosestMatch(string, linkFiles);
    console.log('Application la plus proche :', closestMatch);
    p.innerText = path.basename(closestMatch).replace('.lnk', '');

    if(key == "Enter"){
        ipcRenderer.send('url', `${closestMatch}`);
    }

};