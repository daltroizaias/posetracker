import React from 'react';
import './App.css';
import CameraInput from './components/CameraInput';
import PoseTracker from './PoseTracker';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>Avaliação de Movimento Corporal</h1>
      </header>
      <main>
        <CameraInput>
          {(videoRef) => <PoseTracker videoRef={videoRef} />}
        </CameraInput>
      </main>
    </div>
  );
}

export default App;