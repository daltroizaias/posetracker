import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

interface CameraInputProps {
  children: (videoRef: React.RefObject<HTMLVideoElement | null>) => React.ReactElement;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0; /* Removido padding */
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  z-index: 1;
  opacity: 0;
  object-fit: cover;
`;

const CameraInput: React.FC<CameraInputProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.play();
      } catch (err) {
        console.error('Erro ao acessar a câmera: ', err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Container>
      <Video ref={videoRef} muted autoPlay playsInline />
      {children(videoRef)}
    </Container>
  );
};

export default CameraInput;
