import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';

const dossierSource = 'main'; // Nom du dossier contenant les fichiers à compresser
const dossierDestination = 'minify'; // Dossier de destination pour les fichiers compressés

// Fonction récursive pour récupérer tous les fichiers .js dans le dossier source et ses sous-dossiers
function getFilesRecursively(dir) {
  const files = fs.readdirSync(dir);
  let allFiles = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      allFiles = allFiles.concat(getFilesRecursively(filePath)); // Appel récursif pour les sous-dossiers
    } else if (file.endsWith('.js')) {
      allFiles.push(filePath); // Ajouter le chemin du fichier .js à la liste
    }
  });
  
  return allFiles;
}

// Récupérer tous les fichiers .js dans le dossier source et ses sous-dossiers
const fichiersSource = getFilesRecursively(dossierSource);

export default fichiersSource.map(chemin => ({
  input: chemin, // Utiliser chaque chemin récupéré comme entrée
  output: {
    // Construire le chemin de destination en remplaçant le dossier source par le dossier de destination et en changeant l'extension du fichier
    file: chemin.replace(dossierSource, dossierDestination).replace('.js', '.min.js'),
    format: 'cjs' // Format de module (communément 'cjs' pour Node.js)
  },
  plugins: [
    terser() // Plugin Rollup pour minifier le code avec Terser
  ]
}));
