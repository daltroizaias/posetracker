import React from 'react';
import './App.css';
import CameraInput from './CameraInput';
import PoseTracker from './PoseTracker';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Avaliação de Movimento Corporal</h1>
      </header>
      <main>
        {/* Usamos CameraInput para obter o vídeo. 
            O children é uma função que recebe o videoRef e renderiza o PoseTracker, 
            passando o videoRef para ele. */}
        <CameraInput>
          {(videoRef) => <PoseTracker videoRef={videoRef} />}
        </CameraInput>
      </main>
    </div>
  );
}

export default App;