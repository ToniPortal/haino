/* eslint-disable */

// Modules to control application life and create native browser window
const {
  app, BrowserWindow, Menu, globalShortcut, ipcMain, autoUpdater, dialog, shell,
} = require('electron'),
  electronReload = require('@millyc/electron-reload'),
  path = require('node:path');
/* eslint-enable */

// Hot Reload
// if (!app.isPackaged) {
//   electronReload(__dirname, {
//     electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//     hardResetMethod: 'exit',
//   });
// }

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 544,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      contextIsolation: false,
      nodeIntegration: true,
    },
    frame: false,
  });
  Menu.setApplicationMenu(null);
  
  mainWindow.loadFile('dist/index.html'); // and load the index.html of the app.

  mainWindow.webContents.openDevTools();

  // Créer le raccourci clavier Alt+Enter pour afficher l'application.
  globalShortcut.register('Alt+Space', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    } else {
      mainWindow.hide();
    }
  });

  globalShortcut.register('Escape', () => {
    if (mainWindow.isVisible()) {
      app.quit();
    }
  });


  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => { // Sur macOS, il est courant de recréer une fenêtre dans l'application lorsque
    if (BrowserWindow.getAllWindows().length === 0) createWindow();// l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
  });
});

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('Alt+Space');
  globalShortcut.unregister('Escape');

  // Unregister all shortcuts.
  // globalShortcut.unregisterAll()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Update :



// In this file you can include the rest of your app's specific main process code.

ipcMain.on('restart-app', () => {
  app.relaunch();
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('quit-app', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('update-app', () => {
  checkForUpdates();
});

ipcMain.on('url', async (event, url) => {
  shell.openExternal(url);
});

const downloadAndExtractFile = require('./main/shared/downloadFile');

ipcMain.on('hpm', async (event, namePlugin) => {
  downloadAndExtractFile(namePlugin)
    .then(() => {
      event.returnValue = `Le plugin ${namePlugin} à était télécharger !`; // Envoyer la réponse au processus de rendu

      console.log('Le fichier a été téléchargé avec succès.');
    })
    .catch((error) => {
      event.returnValue = `Erreur lors du téléchargement du fichier : ${error.message}`; // Envoyer l'erreur au processus de rendu

      console.error('Une erreur s\'est produite lors du téléchargement du fichier :', error);
    });
});
// You can also put them in separate files and require them here.


//export for jest !!
module.exports = {
  createWindow
};