const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const sharp = require('sharp');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 250,
    titleBarStyle: 'hidden',
    backgroundColor: '#101A1F',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready event
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle WebP conversion
async function convertFileToWebp(inputPath, inputName, outputPath) {
  try {
    await sharp(inputPath).toFile(`${outputPath}/${inputName}.webp`);
    return true;
  } catch (err) {
    throw err;
  }
}

// IPC handlers
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose a directory where the WebP files will be saved.',
    buttonLabel: 'Convert',
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('convert-to-webp', async (event, { inputPath, inputName, outputPath }) => {
  return await convertFileToWebp(inputPath, inputName, outputPath);
});

ipcMain.handle('show-message', async (event, { type, message }) => {
  await dialog.showMessageBox(mainWindow, {
    type,
    message
  });
});

ipcMain.handle('show-error', async (event, message) => {
  await dialog.showErrorBox('Sorry!', message);
});
