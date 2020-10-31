const { app, BrowserWindow, Menu, nativeImage, ipcMain, Tray } = require('electron')
const windowStateKeeper = require('electron-window-state')
const fs = require('fs');
const mm = require('musicmetadata');

process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

const mainMenu = Menu.buildFromTemplate([
  ...(isMac ? [{ role: 'appMenu'}] : []),
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  ...(isDev ? [{ label: 'For Developers', submenu: [{ role: 'reload' }, { role: 'toggledevtools'}] }] : []),
  {
    label: 'About',
    submenu: [ { label: 'Dynamo Player', click: () => { createAboutWindow() }} ]
  }
])

const trayContextMenu = Menu.buildFromTemplate([
  {
    label: 'DynamoPlayer',
    click: () => { mainWindow.show() }
  },
  {
    label: 'Exit',
    click: () => { 
      mainWindow.destroy();
      app.quit() 
    }
  }
])

let mainWindow = null, aboutWindow = null, tray = null;

const createTray = () => {
  const trayImage = nativeImage.createFromPath('./assets/img/tray.png')
  tray = new Tray(trayImage);
  tray.setToolTip('DynamoPlayer');

  tray.on('click', e => {
    mainWindow.isMinimized() ? mainWindow.show() : mainWindow.minimize();
  })
  tray.setContextMenu(trayContextMenu);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 400, height: 500,
    resizable: false,
    icon: './assets/img/icon.ico',
    webPreferences: { nodeIntegration: true }
  })

  aboutWindow.loadFile('./renderer/about.html');

  aboutWindow.on('close', () => {
    aboutWindow = null;
  })

  const aboutMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [{ label: 'Exit', click: () => { aboutWindow.destroy() }}]
    }
  ])
  aboutWindow.setMenu(aboutMenu)
}

function createWindow () {

  const winState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 500
  })

  mainWindow = new BrowserWindow({
    width: 850, height: 600,
    x: winState.x, y: winState.y,
    resizable: false,
    icon: './assets/img/icon.ico',
    webPreferences: { nodeIntegration: true, enableRemoteModule: true }
  })

  mainWindow.setMenu(mainMenu)
  mainWindow.loadFile('renderer/index.html')

  mainWindow.on('close', (e) => {
    e.preventDefault();
    // let js = 'if(!document.querySelector(".cover-image").classList.contains("pause-spin")) document.getElementById("play").click()'
    // mainWindow.webContents.executeJavaScript(js);
    mainWindow.reload();
    mainWindow.hide();
  })

  createTray();

  console.log(mainWindow.getBounds())
  winState.manage(mainWindow)
}

let acf, acd
ipcMain.on('songs-selected',  (e, args) => {
  loadSongInfo(e, args)
})

function loadSongInfo (e, arr) {
  let songs = [];
  for(let i = 0; i < arr.length; i++) {
    let readableStream = fs.createReadStream(arr[i]);
    let parser = mm(readableStream, function (err, metadata) {
      if (err) throw err;
      // console.log(metadata);
      acf = metadata.picture[0].format// album_cover_format
      acd = metadata.picture[0].data // album_cover_data
      album_cover = `data:${acf};base64,${Buffer.from(acd).toString('base64')}`
      songs.push({ path: arr[i], title: metadata.title, artist: metadata.artist, duration: metadata.duration, album_cover})
      // console.log(songs)
      readableStream.close();
      if(songs.length === arr.length) {
        e.reply('songs-info-loaded', songs)
      }
    });
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', (e) => {
  if(process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})