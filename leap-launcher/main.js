const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  const leapPath = path.join(__dirname, '..');

  const indexPath = path.join(__dirname, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('[ERROR] index.html not found at:', indexPath);
  }

  win.loadFile(indexPath).catch(err => {
    console.error('[ERROR] failed to load index.html:',err);
  });

  win.webContents.openDevTools();

ipcMain.on('start-app', () => {
  console.log('[INFO] Checking PostgreSQL...');
  exec('where psql', (err) => {
    if (err) return console.error('[ERROR] PostgreSQL not found in PATH.');

    console.log('[INFO] Checking Node.js...');
    exec('where node', (err) => {
      if (err) return console.error('[ERROR] Node.js not found in PATH.');

      console.log('[INFO] Building React app...');
      exec('npm run build', { cwd: leapPath }, (err, stdout, stderr) => {
        if (err) {
          console.error('[ERROR] React build failed');
          console.error(stderr);
          return;
        }

        console.log('[INFO] React build completed successfully');

        console.log('[INFO] Starting backend...');
        const backendStart = exec(`start "" cmd /k "cd ${leapPath}/backend && npm install && node server.js"`);

        // Add small delay to let backend initialize, or use wait-on for a health check
        setTimeout(() => {
          const disListener = path.join(leapPath, 'dis_receiver');
          const disListenerEXE = "leap dis manager.exe";

          console.log('[DEBUG] Dis Listener path:', disListener);
          console.log('[DEBUG] dislistenerexe:', disListenerEXE);
          console.log('[INFO] Starting listener...');

          exec(`start "" cmd /k "cd /d ${disListener} && \"${disListenerEXE}\""`, (err) => {
            if (err) console.error('[ERROR] Failed to start listener', err);
          });

          console.log('[INFO] Restarting nginx...');
          const nginxPath = path.join(leapPath, 'nginx-1.27.5');

          console.log('[DEBUG] nginx path:', nginxPath);
          exec('nginx.exe -s stop', { cwd: nginxPath }, () => {
            const nginx = spawn('nginx.exe', [], {
              cwd: nginxPath,
              detached: true,
              stdio: 'ignore',
            });

            console.log('[INFO] Nginx started successfully');

            // Wait before opening the browser
            setTimeout(() => {
              exec('cmd /c start "" "http://localhost"', (err) => {
                if (err) {
                  console.error('[ERROR] Failed to open browser via shell:', err);
                } else {
                  console.log('[INFO] Browser opened using shell');
                }
                console.log('opening localhost');
              });
            }, 5000); // Delay to let nginx fully serve the app
          });
        }, 5000); // Delay to give backend time to be ready
      });
    });
  });
});



  ipcMain.on('stop-app', () => {
    console.log('[INFO] Stopping app...');
    exec('taskkill /F /IM node.exe');
    exec('nginx.exe -s stop', { cwd: path.join(leapPath, 'nginx-1.27.5') });
  });
}

app.whenReady().then(createWindow);

app.on('before-quit', () => {
  console.log('[INFO] Quitting app — stopping services...');
  exec('taskkill /F /IM node.exe');
  exec('nginx.exe -s stop', { cwd: path.join(leapPath, 'nginx-1.27.5') });
});
