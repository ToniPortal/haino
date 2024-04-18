// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, autoUpdater, dialog, shell } = require('electron')
const path = require('node:path')


// const server = "https://hazel-lpidquvf8-pastres-projects.vercel.app"
// const url = `${server}/update/${process.platform}/${app.getVersion()}`

// autoUpdater.setFeedURL({ url })

// Hot Reload
if (!app.isPackaged) {
  const electronReload = require('@millyc/electron-reload');
  electronReload(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
  });
}


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 544,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      contextIsolation: false,
      nodeIntegration: true

    },
    frame: false,
  })
  Menu.setApplicationMenu(null)
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile('dist/index.html') // and load the index.html of the app.

  mainWindow.webContents.openDevTools()

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

}



// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs. 
app.whenReady().then(() => {

  createWindow()


  app.on('activate', function () { // Sur macOS, il est courant de recréer une fenêtre dans l'application lorsque
    if (BrowserWindow.getAllWindows().length === 0) createWindow();// l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes.
  });


})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('Alt+Space')
  globalShortcut.unregister('Escape');

  // Unregister all shortcuts.
  // globalShortcut.unregisterAll()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


//Update :

// Fonction pour vérifier les mises à jour
const checkForUpdates = async () => {
  try {
    // Obtenez les informations sur la dernière version de release depuis GitHub
    const response = await fetch('https://api.github.com/repos/votre-utilisateur/votre-depot/releases/latest');
    const release = await response.json();
    const latestVersion = release.tag_name;

    // Comparez la dernière version avec la version actuelle
    if (latestVersion !== app.getVersion()) {
      // Si une mise à jour est disponible, demandez à l'utilisateur s'il souhaite mettre à jour
      const choice = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Mettre à jour', 'Annuler'],
        defaultId: 0,
        title: 'Nouvelle version disponible',
        message: `Une nouvelle version (${latestVersion}) est disponible. Voulez-vous mettre à jour ?`
      });

      if (choice.response === 0) {
        // Si l'utilisateur choisit de mettre à jour, utilisez electron-updater pour télécharger et installer la nouvelle version
        await autoUpdater.checkForUpdatesAndNotify();
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour :', error);
  }
};


autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application')
  console.error(message)
})

// In this file you can include the rest of your app's specific main process code. 

ipcMain.on('restart-app', () => {
  app.relaunch();
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('quit-app', () => {
  if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('update-app', () => {
  checkForUpdates()
});

ipcMain.on('url', async (event, url) => {
  shell.openExternal(url)
});



// You can also put them in separate files and require them here.