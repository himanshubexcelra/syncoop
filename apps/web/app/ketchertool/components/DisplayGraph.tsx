import { useEffect } from "react";
import Graph from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";

const sigmaStyle = { height: "500px", width: "500px" };

// Component that load the graph
export const LoadGraph = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const STRING_SVG_ICON = `<svg
      fill="#000000"
      stroke-width="0"
      viewBox="0 0 320 512"
      height="200px"
      width="200px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M142.9 96c-21.5 0-42.2 8.5-57.4 23.8L54.6 150.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L40.2 74.5C67.5 47.3 104.4 32 142.9 32C223 32 288 97 288 177.1c0 38.5-15.3 75.4-42.5 102.6L109.3 416H288c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9L200.2 234.5c15.2-15.2 23.8-35.9 23.8-57.4c0-44.8-36.3-81.1-81.1-81.1z"
      ></path>
    </svg>`;
    const graph = new Graph();
    function svgToDataURI(svg: string): string {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      return URL.createObjectURL(blob);
    }
    /* graph.addNode("first", { x: 0, y: 0, size: 15, label: "My first node", color: "#FA4F40" }); */
    graph.addNode("e", {
      x: 3,
      y: -4,
      size: 40,
      label: "E",
      color: "blue",
      image: svgToDataURI(STRING_SVG_ICON),
      type: "pictogram",
    });
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Component that display the graph
export const DisplayGraph = () => {
  return (
    <SigmaContainer style={sigmaStyle}>
      <LoadGraph />
    </SigmaContainer>
  );
};
