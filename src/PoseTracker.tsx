// src/PoseTracker.tsx

import React, { useRef, useEffect } from 'react';
import * as pose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

interface PoseTrackerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

const PoseTracker: React.FC<PoseTrackerProps> = ({ videoRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const poseDetector = new pose.Pose({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        });

        poseDetector.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        poseDetector.onResults((results) => {
            const canvasElement = canvasRef.current;
            if (!canvasElement) return;

            const canvasCtx = canvasElement.getContext('2d');
            if (!canvasCtx) return;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            canvasElement.width = results.image.width;
            canvasElement.height = results.image.height;

            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.poseLandmarks) {
                drawingUtils.drawConnectors(
                    canvasCtx,
                    results.poseLandmarks,
                    pose.POSE_CONNECTIONS,
                    { color: '#00FF00', lineWidth: 4 }
                );

                drawingUtils.drawLandmarks(
                    canvasCtx,
                    results.poseLandmarks,
                    { color: '#FF0000', lineWidth: 5 }
                );
            }

            canvasCtx.restore();
        });

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                try {
                    await poseDetector.send({ image: videoElement });
                } catch (err) {
                    console.error('Erro ao enviar frame para o poseDetector:', err);
                }
            },
            width: 640,
            height: 480
        });

        const startCamera = () => {
            camera.start().catch((err) => {
                console.error('Erro ao iniciar câmera:', err);
            });
        };

        if (videoElement.readyState >= 3) {
            startCamera();
        } else {
            videoElement.addEventListener('canplay', startCamera, { once: true });
        }

        return () => {
            poseDetector.close();
            camera.stop();
        };
    }, [videoRef]);

    return (
        <div style={{ position: 'relative', width: 640, height: 480 }}>
            <h3>Processando Movimento...</h3>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 640,
                    height: 480,
                    border: '1px solid black'
                }}
            />
        </div>
    );
};

export default PoseTracker;
