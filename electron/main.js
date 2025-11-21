import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win;

// Configure app to allow internet access and disable autofill features
// (autofill disable suppresses harmless DevTools console errors)
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,AutofillServerCommunication,AutofillEnableAccountWalletStorage');
app.commandLine.appendSwitch('disable-autofill');

function createWindow() {
  // Configure session before creating window
  const ses = session.defaultSession;

  // Disable autofill at session level
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'autofill') {
      callback(false); // Deny autofill permission requests
    } else {
      callback(true);
    }
  });

  // Allow all origins for fetch requests (required for API calls)
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { ...details.requestHeaders } });
  });

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(process.env.VITE_PUBLIC, 'electron.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Disable web security for API access
      allowRunningInsecureContent: false,
    },
  });

  // Suppress harmless DevTools Autofill console errors using new API
  win.webContents.on('console-message', (event) => {
    const { level, message } = event;
    if (
      typeof message === 'string' &&
      (message.includes("Autofill.enable") || message.includes("Autofill.setAddresses"))
    ) {
      // These are harmless DevTools protocol errors - they're logged but don't affect functionality
      // The command line flags should prevent most of them
    }
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devtools in development
    win.webContents.openDevTools();
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file system operations
ipcMain.handle('fs:getUserDataPath', () => {
  return app.getPath('userData');
});

ipcMain.handle('fs:writeFile', async (_event, filePath, data) => {
  try {
    await fs.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:readFile', async (_event, filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:deleteFile', async (_event, filePath) => {
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:fileExists', async (_event, filePath) => {
  try {
    return existsSync(filePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
});

ipcMain.handle('fs:readDir', async (_event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    return { success: true, files };
  } catch (error) {
    console.error('Error reading directory:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs:ensureDir', async (_event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error creating directory:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);
