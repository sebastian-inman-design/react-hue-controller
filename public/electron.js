const Electron = require('electron')
const App = Electron.app
const Browser = Electron.BrowserWindow

App.on('ready', () => {

  const path = require('path')
  const isDev = require('electron-is-dev')

  const Main = new Browser({
    width: 400,
    height: 943
  });

  if(!isDev) {

    Main.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

  }else{

    Main.loadURL('http://localhost:3000')
    Main.webContents.openDevTools()

  }

})