"use client"; // Add this at the very top of the file
import { ThemeProvider, createTheme } from "@mui/material";
import { useCallback, useState } from "react";
import { ButtonsConfig, Editor } from "ketcher-react";
import { Ketcher } from "ketcher-core";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import "ketcher-react/dist/index.css";
import styles from "./page.module.css";

import { Panel } from "./components/Panel";
import { OutputArea } from "./components/OutputArea";
import { initiallyHidden } from "./constants/buttons";
import { defaultTheme } from "./constants/defaultTheme";
import { KetcherAPI } from "../../utils/ketcherFunctions";

const theme = createTheme(defaultTheme);

const getHiddenButtonsConfig = (btnArr: string[]): ButtonsConfig => {
  return btnArr.reduce((acc: any, button: any) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {});
};

/* const structServiceProvider = new RemoteStructServiceProvider(
process.env.REACT_APP_API_PATH!,
{
  'custom header': 'value' // optionally you can add custom headers object 
}
) */

const structServiceProvider = new StandaloneStructServiceProvider();

const getUniqueKey = (() => {
  let count = 0;
  return () => {
    count += 1;
    return `editor-key-${count}`;
  };
})();

export default function Ketchertool() {
  const [outputValue, setOutputValue] = useState("");
  const [hiddenButtons, setHiddenButtons] = useState(initiallyHidden);
  const [editorKey, setEditorKey] = useState("first-editor-key");

  const updateHiddenButtons = useCallback(
    (buttonsToHide: string[]) => {
      setHiddenButtons(buttonsToHide);
      setEditorKey(getUniqueKey());
    },
    [setHiddenButtons, setEditorKey]
  );

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.GridWrapper}>
        <div className={styles.KetcherBox}>
          <Editor
            key={editorKey}
            staticResourcesUrl={process.env.PUBLIC_URL}
            buttons={getHiddenButtonsConfig(hiddenButtons)}
            structServiceProvider={structServiceProvider}
            errorHandler={(err) => console.log(err)}
            onInit={(ketcher: Ketcher) => {
              (global as any).ketcher = ketcher;
              (global as any).KetcherFunctions = KetcherAPI(
                (global as any).ketcher
              );
            }}
          />
        </div>
        <div className={styles.PanelBox}>
          <Panel
            printToTerminal={setOutputValue}
            hiddenButtons={hiddenButtons}
            buttonsHideHandler={updateHiddenButtons}
          />
        </div>
        <div className={styles.PanelBox}>
          <OutputArea
            outputValue={outputValue}
            setOutputValue={setOutputValue}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
