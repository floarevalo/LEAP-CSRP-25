const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

const leapPath = path.join(__dirname, '..');
const indexPath = path.join(__dirname, 'index.html');
const nginxPath = path.join(leapPath, 'nginx-1.27.5');
const appDataPath = path.join(app.getPath('userData'), 'first-run-flag.txt');

let backendProcess = null;
let listenerProcess = null;
let nginxProcess = null;
let nginxStarted = false;
let browserProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (!fs.existsSync(indexPath)) {
    console.error('[ERROR] index.html not found at:', indexPath);
  }

  win.loadFile(indexPath).catch(err => {
    console.error('[ERROR] failed to load index.html:', err);
  });

  //win.webContents.openDevTools(); //debugging window for development
  if(!fs.existsSync(appDataPath)) {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Port 80 set up for LEAP',
      message: `To ensure LEAP can run on other computers:
1. Open Windows Firewall Defender
2. Click Advanced settings
3. In Left pane click inbound rules
4. On the right click "New Rule"
5. Select "Port" -> Newt -> TCP _> Specific local ports: 80 -> Next
6. Allow connection -> Next -> Private (if all computers running LEAP are on the same private network) -> name it LEAP permissions -> Finish

You may need to stop services on port 80 to do this, but unlikely
This message only shows once.`
    });
    fs.writeFileSync(appDataPath, 'shown');
  }

  ipcMain.on('start-app', () => {
    console.log('[INFO] Checking PostgreSQL...');
    exec('where psql', (err) => {
      if (err) {
        exec('start cmd /c start "" "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"');
        dialog.showMessageBoxSync({
          type: 'error',
          title: 'PostgreSQL Not Found',
          message: ` PostgreSQL is not installed or not available in your system PATH.
        
How to fix:
1. The download page should open in your browser, if not use this link: 
    https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Download PostgreSQL 16.9 and use the installation file to set up
3. when prompted my the PostgreSQL installer set password to postgres and install on port 5432
4. During the install remember to check "add PostgreSQL to PATH"
5. If you already have PostreSQL 16.9 installed but it is not in path:
  a) search this in for "C:\\Program Files\\PostgreSQL\\16\\bin in your file manager
  b) go to your "Edit System Enviroment variables
  c) click enviroment variables
  d) under system variables click path then edit
  e) now click new and put the link to your own specific postgres bin folder here
6. If your have PostgresSQL already but it is not on port 5432 installing this version will not be impeded
7. if you are getting an error indicating port 5432 is not free follow these steps:
  a) open your computer task manager
  b) go to performance tab
  c) find the three dots/menu and click "Open Resource Monitor"
  d) in rescource monitor find the network tab
  e) look through the listening ports section to find what is on port 5432
  f) get the PID for the process
  g) now in task manager go to detail and find the process that matches that PID
  h) right click and hit "end task"
7. For a user interface for the database use pgAdmin 4: 
  a) in ths you can create a database for named LEAP and restore our LEAP database sql file, this is in plain text
  b) by doing this you have a user interface to change the database manually or the change the units being used in LEAP
8. Restart computer and retry LEAP launcher`
        });
        return;
      }
      console.log('PostgreSQL found');

      console.log('[INFO] Checking Node.js...');
      exec('where node', (err) => {
        if (err) {
          exec('cmd /c start "" "https://nodejs.org/en/download/"');
          dialog.showMessageBoxSync({
            type: 'error',
            title: 'Node.js not found',
            message: `Node.js is not installed or not available in your system PATH.
How to fix:
1. The Node.js download page will open in your browser, if not use this link:
   https://nodejs.org/en/download/
2. install Node.js make sure the last box at the top of the download page says with npm and use the installer for the .msi version
3. make sure to add to PATH when prompted by the installer
4. if you think you already have Node.js installed with npm and as .msi you will need to add it to PATH:
  a)find your Node.js installation path with C:\Program Files\nodejs\ (this is the default intall path)
  b)go to your "Edit System Enviroment variables
  c) click enviroment variables
  d) under system variables click path then edit
  e) now click new and put the link to your own specific node installation folder path here
5. restart your computer and try LEAP launcher again`
          });
          return;
        }
        console.log('Node.js found');

        console.log('[INFO] Building React app...');
        exec('npm run build', { cwd: leapPath }, (err, stdout, stderr) => {
          if (err) {
            console.error('[ERROR] React build failed');
            console.error(stderr);
          }

          console.log('[INFO] React build completed successfully');

          console.log('[INFO] Starting backend...');
          exec(`start "" cmd /k "cd ${leapPath}/backend && node server.js"`); //this is for development and debugging so that the backend printouts show
          //backendProcess = exec('node server.js', {
            //cwd: path.join(leapPath, 'backend'),
          //});


          // Add small delay to let backend initialize
          setTimeout(() => {
            const disPath = path.join(leapPath, 'dis_receiver', 'leap dis manager.exe');

            console.log('[DEBUG] Dis Listener path:', disPath);

            if (fs.existsSync(disPath)) {
              console.log('[INFO] Starting dis listener');
              listenerProcess = spawn(`"${disPath}"`, {
                shell: true,
                detached: true,
                stdio: 'ignore'
              });
              listenerProcess.unref();
              //listenerProcess = exec(`"${disPath}"`);
            } else console.warn('dis path does not exist:', disPath);

            console.log('[INFO] Restarting nginx...');

            console.log('[DEBUG] nginx path:', nginxPath);
            exec('nginx.exe -s stop', { cwd: nginxPath }, () => {
              nginxProcess = spawn('nginx.exe', [], {
                cwd: nginxPath,
                detached: false,
                stdio: 'ignore',
              });
              nginxProcess.unref();
              nginxStarted = true;

              console.log('[INFO] Nginx started successfully');

              // Wait before opening the browser
              setTimeout(() => {
                const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // adjust if needed
                const tempProfile = path.join(__dirname, 'leap-browser-profile');

                if (!fs.existsSync(tempProfile)) fs.mkdirSync(tempProfile, { recursive: true });

                browserProcess = spawn(chromePath, [
                  `--user-data-dir=${tempProfile}`,
                  '--new-window',
                  'http://localhost'
                ], {
                  detached: true,
                  stdio: 'ignore',
                });
                browserProcess.unref();

              }, 4000); // Delay to let nginx fully serve the app
            });
          }, 3000); // Delay to give backend time to be ready
        });
      });
    });
  });

  ipcMain.on('stop-app', () => {
    console.log('[INFO] Stopping app...');
    stopAllProcesses();
  });

  win.on('close', () => {
    stopAllProcesses();
  })
}


function stopAllProcesses() {
  console.log('[INFO] Stopping processes...');

  if (backendProcess) {
    try {
      backendProcess.kill();
      console.log('[INFO] Backend stopped');
    } catch (e) {
      console.warn('[WARN] Failed to stop backend:', e.message);
    }
  }

  exec(`taskkill /F /IM "leap dis manager.exe" /T`, (err) => {
    if (err) console.warn('[WARN] Failed to stop listener', err.message);
    else console.log('[INFO] Listener closed');
  })

  if (browserProcess && browserProcess.pid) {
    try {
      process.kill(browserProcess.pid);
      console.log('[INFO] LEAP Chrome tab closed');
    } catch (e) {
      console.warn('[WARN] Failed to close LEAP Chrome tab:', e.message);
    }
  }


  if (nginxStarted) {
    exec('nginx.exe -s stop', { cwd: nginxPath }, (err) => {
      if (err) console.warn('[WARN] Failed to stop nginx:', err.message);
      else console.log('[INFO] Nginx stopped');
    });
  }

  exec('taskkill /F /IM cmd.exe /T', (err) => {
    if (err) console.warn('{WARN] Failed to close command window:', err.message);
    else console.log('[INFO] command window closed');
  });
}

app.whenReady().then(createWindow);

app.on('before-quit', () => {
  console.log('[INFO] Quitting app — stopping services...');
  stopAllProcesses();
});
