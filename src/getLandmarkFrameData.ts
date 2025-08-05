// getLandmarkFrameData.ts
import { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { getNamedLandmarks3D } from "./PositionLandMarks";

export interface LandmarkFrameData {
  frame: string | number;
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number | null;
}

export function getLandmarkFrameData(result: PoseLandmarkerResult, frameId: string | number): LandmarkFrameData[] {
  const namedLandmarks = getNamedLandmarks3D(result);

  return namedLandmarks.map((landmark) => ({
    frame: frameId,
    name: landmark.name,
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    visibility: landmark.visibility
  }));
}
