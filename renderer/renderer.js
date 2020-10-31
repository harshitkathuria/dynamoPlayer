const { remote, ipcRenderer } = require('electron')
const { dialog, app } = remote;
const { loadSongsList } = require('./ui.js')
const addBtn = document.getElementById('add-songs');

addBtn.addEventListener('click', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Select song(s)',
    defaultPath: app.getPath('music'),
    properties: ['multiSelections', 'openFile'],
    filters: [ { name: 'Audio', extensions: ['mp3', 'ogg', 'wav'] }]
  })

  if(!res.canceled) {
    // console.log(res.filePaths)
    ipcRenderer.send('songs-selected', res.filePaths)
  }
})

ipcRenderer.on('songs-info-loaded', (e, args) => {
  // console.log(args)
  loadSongsList(args)
})

new Notification('DynamoPlayer', {
  body: 'Application running in background',
  icon: '../assets/img/notif_icon.png',
  silent: true
})