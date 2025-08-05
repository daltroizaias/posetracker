// components/LandmarkTable.tsx
import React from "react";

export interface LandmarkRow {
  frame: number | string;
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number | null;
}

interface LandmarkTableProps {
  data: LandmarkRow[];
}

const LandmarkTable: React.FC<LandmarkTableProps> = ({ data }) => {
  if (!data.length) return null;

  return (
    <div style={{
      maxHeight: "100%",
      overflowY: "auto",
      width: "100%",
      maxWidth: "500px",
      padding: "1rem",
      boxSizing: "border-box",
      background: "#fff"
    }}>
      <table style={{
        width: "100%",
        fontSize: "12px",
        borderCollapse: "collapse"
      }}>
        <thead>
          <tr>
            <th>Frame</th>
            <th>Landmark</th>
            <th>X</th>
            <th>Y</th>
            <th>Z</th>
            <th>Visibility</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.frame}</td>
              <td>{item.name}</td>
              <td>{item.x.toFixed(4)}</td>
              <td>{item.y.toFixed(4)}</td>
              <td>{item.z.toFixed(4)}</td>
              <td>{item.visibility !== null ? item.visibility.toFixed(2) : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandmarkTable;
