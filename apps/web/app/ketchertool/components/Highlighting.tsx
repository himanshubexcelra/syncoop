import { useState } from "react";
import styles from "../page.module.css";
import { Button } from "@mui/material";

type HighlightingProps = { printToTerminal: (arg: string) => void };

export const Highlighting = ({ printToTerminal }: HighlightingProps) => {
  const [color, setColor] = useState("#FF7F50");

  const colorHandler = (event: any) => {
    setColor(event.target.value);
  };

  const getAndPrintHighlights = () => {
    const highlights = KetcherFunctions.getAllHighlights();
    printToTerminal(JSON.stringify(highlights, null, 2));
  };

  const createHighlight = () => {
    const { lastHighlightID, lastHighlight } =
      KetcherFunctions.highlightSelection(color);

    if (!lastHighlight) {
      return;
    }

    const message =
      "New highlight ID: " +
      lastHighlightID +
      ", content: \n" +
      JSON.stringify(lastHighlight, null, 2);
    printToTerminal(message);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <input
          type="color"
          value={color}
          onChange={colorHandler}
          className={styles.colorInput}
        />
        <Button variant="contained" size="small" onClick={createHighlight}>
          Highlight Selection
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => KetcherFunctions.clearHighlights()}
        >
          Clear
        </Button>
      </div>
      <Button
        style={{ display: 'block', marginTop: '10px', }}
        variant="contained"
        size="small"
        onClick={getAndPrintHighlights}
      >
        Get all Highlights
      </Button>
    </div>
  );
};
