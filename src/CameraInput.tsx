// src/CameraInput.tsx

import React, { useRef, useEffect } from 'react';

interface CameraInputProps {
    children: (videoRef: React.RefObject<HTMLVideoElement | null>) => React.ReactElement;
}

const CameraInput: React.FC<CameraInputProps> = ({ children }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const startCamera = async () => {
            if (!videoRef.current) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                
                // Adicionamos 'playsInline = true' para garantir o autoplay em navegadores móveis e
                // chamamos play() imediatamente.
                videoRef.current.playsInline = true;
                videoRef.current.play();

            } catch (err) {
                console.error("Erro ao acessar a câmera: ", err);
                // ... (alerta de erro) ...
            }
        };

        startCamera();

        // ... (função de limpeza) ...
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
    <div>
        <video
        ref={videoRef}
        style={{
            display: 'block',
            transform: 'scaleX(-1)', // espelha horizontalmente
            width: 640,
            height: 480,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            opacity: 0, // invisível, mas mantém o layout
        }}
        muted
        autoPlay
        playsInline
        />
        {children(videoRef)}
    </div>
    );

};

export default CameraInput;