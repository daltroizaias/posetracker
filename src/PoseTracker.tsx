import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  PoseLandmarkerResult, // Importe para tipagem mais clara
} from "@mediapipe/tasks-vision";
import { getNamedLandmarks3D } from "./PositionLandMarks";
import styled from "styled-components";
import LandmarkTable, { LandmarkRow } from "./components/LandmarkTable";

interface PoseTrackerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row; /* lado a lado em telas maiores */
  }

  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16/9;
  background: #000;

  @media (min-width: 768px) {
    height: auto;
    max-height: none;
  }
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

// Caminho para o arquivo do modelo. Certifique-se de que ele esteja em public/models/
// Ex: public/models/pose_landmarker_full.task
const MODEL_FILE = "/models/pose_landmarker_full.task"; //

const PoseTracker: React.FC<PoseTrackerProps> = ({ videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use useRef para armazenar a instância do landmarker
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null); // Para reutilizar DrawingUtils

  const lastVideoTimeRef = useRef<number>(-1); // Para evitar processar o mesmo frame múltiplas vezes

  const [landmarkData, setLandmarkData] = useState<LandmarkRow[]>([]);
  // Função para criar o PoseLandmarker
  const createLandmarker = useCallback(async () => {
    try {
      // O FilesetResolver precisa do caminho para a pasta onde vision_wasm_internal.js e .wasm estão.
      // Use o CDN para maior robustez, ou '/models/' se você copiou os arquivos localmente.
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm" //
        // OU: '/models/' se você copiou os arquivos WASM para public/models/
      );

      const landmarker = await PoseLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath: MODEL_FILE, //
            delegate: "GPU", // 'GPU' para melhor desempenho, 'CPU' como fallback
          },
          runningMode: "VIDEO", //
          numPoses: 1, //
        }
      );

      poseLandmarkerRef.current = landmarker;
      console.log("PoseLandmarker criado com sucesso.");
      // Não chame startDetection aqui, pois ele será chamado no useEffect do loop.
    } catch (error) {
      console.error("Erro ao criar PoseLandmarker:", error); //
      // Considere exibir uma mensagem de erro na UI
    }
  }, []); // createLandmarker não tem dependências que mudem

  // Função principal para detectar e desenhar
  const detectAndDraw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = poseLandmarkerRef.current;

    if (!video || !canvas || !landmarker) {
      requestAnimationFrame(detectAndDraw); // Tenta novamente no próximo frame
      return;
    }

    // Garante que o canvas tem as mesmas dimensões do vídeo
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Não foi possível obter o contexto 2D do canvas.");
      requestAnimationFrame(detectAndDraw);
      return;
    }

    // Inicializa DrawingUtils apenas uma vez
    if (!drawingUtilsRef.current) {
      drawingUtilsRef.current = new DrawingUtils(ctx);
    }
    const drawingUtils = drawingUtilsRef.current;

    let results: PoseLandmarkerResult | undefined = undefined;

    // Processa o frame do vídeo se for um novo frame
    if (video.currentTime !== lastVideoTimeRef.current) {
      const nowInMs = performance.now();
      results = landmarker.detectForVideo(video, nowInMs); //
      lastVideoTimeRef.current = video.currentTime;
    }

    // Limpa o canvas e desenha o frame do vídeo
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Desenha os landmarks, se existirem
    if (results && results.landmarks) {
        const named = getNamedLandmarks3D(results);

        // ✅ Gera um identificador de frame (timestamp ou contador)
        const frameId = Math.floor(performance.now());

        // ✅ Prepara os dados para a tabela
        const landmarkWithFrame: LandmarkRow[] = named.map(l => ({
          ...l,
          frame: frameId
        }));

        // ✅ Atualiza o estado
        setLandmarkData(landmarkWithFrame);

        // ✅ Desenha os landmarks
        for (const landmark of results.landmarks) {
          drawingUtils.drawLandmarks(landmark, {
            color: "yellow",
            lineWidth: 2,
          });
          drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
            color: "green",
            lineWidth: 4,
          });
        }
      }
    ctx.restore();

    // Continua o loop de detecção
    requestAnimationFrame(detectAndDraw);
  }, [videoRef]); // Dependências: videoRef

  useEffect(() => {
    // Inicia a criação do landmarker
    createLandmarker();

    // Inicia o loop de detecção e desenho quando o componente monta
    // Garante que o vídeo está pronto para ser processado
    const videoElement = videoRef.current;
    if (videoElement) {
      const startProcessing = () => {
        console.log("Vídeo pronto, iniciando processamento de pose.");
        requestAnimationFrame(detectAndDraw);
      };

      if (videoElement.readyState >= 3) {
        // HAVE_FUTURE_DATA ou HAVE_ENOUGH_DATA
        startProcessing();
      } else {
        videoElement.addEventListener("canplay", startProcessing, {
          once: true,
        });
      }

      // Cleanup para remover o listener se o componente desmontar antes do 'canplay'
      return () => {
        videoElement.removeEventListener("canplay", startProcessing);
        if (poseLandmarkerRef.current) {
          poseLandmarkerRef.current.close(); //
          poseLandmarkerRef.current = null;
        }
        if (drawingUtilsRef.current) {
          drawingUtilsRef.current = null;
        }
        lastVideoTimeRef.current = -1; // Resetar o tempo do vídeo
      };
    }
  }, [createLandmarker, detectAndDraw, videoRef]); // Dependências: createLandmarker, detectAndDraw, videoRef

  return (
    <Wrapper>
      <CanvasWrapper>
        <Canvas ref={canvasRef} />
      </CanvasWrapper>
        <LandmarkTable data={landmarkData} />
    </Wrapper>
);
};

export default PoseTracker;
