const path = require('path');
const fs = require('fs');
const extract = require('extract-zip');
// const fetch = require('node-fetch');
const { pipeline } = require('stream/promises');

async function downloadAndExtractFile(namePlugin) {
  try {
    // URL et nom du fichier à télécharger
    const fileUrl = `https://bddship.alwaysdata.net/download/${namePlugin}`;
    const fileName = `${namePlugin}.zip`;

    // Créer le répertoire de destination
    const destinationPath = path.join(__dirname, '..', 'plugin', namePlugin);
    await fs.promises.mkdir(destinationPath, { recursive: true });

    // Télécharger le fichier ZIP
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Impossible de télécharger le fichier. Code d'erreur : ${response.status}`);
    }

    // Écrire le contenu du fichier ZIP téléchargé dans un fichier temporaire
    const tempFilePath = path.join(destinationPath, fileName);
    const destStream = fs.createWriteStream(tempFilePath);
    await pipeline(response.body, destStream);

    // Décompresser le fichier ZIP dans le répertoire de destination
    await extract(tempFilePath, { dir: destinationPath });

    // Supprimer le fichier ZIP temporaire
    await fs.promises.unlink(tempFilePath);

    /* eslint-disable-next-line */
    console.log('Le fichier a été téléchargé, décompressé et déplacé avec succès.');

    return destinationPath;
  } catch (error) {
    throw new Error(`Une erreur s'est produite lors du téléchargement et de l'extraction du fichier : ${error.message}`);
  }
}

module.exports = downloadAndExtractFile;
