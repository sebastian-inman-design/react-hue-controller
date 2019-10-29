import React from 'react'
import MainMenu from './components/MainMenu'
import BridgeSync from './components/BridgeSync'
import FooterMenu from './components/FooterMenu'


function App() {

  return (
    <div className="App" style={{padding: '76px 20px 76px 20px', background: '#FCFCFC'}}>
      <MainMenu/>
      <BridgeSync/>
      <FooterMenu/>
    </div>
  );
}

export default App;
