"use client";

import { useState, useEffect } from "react";
import { ButtonsConfig, Editor } from "ketcher-react";
import { Ketcher } from "ketcher-core";
import { RemoteStructServiceProvider } from "ketcher-core";
import "ketcher-react/dist/index.css";
import { initiallyHidden } from "./constants/buttons";
import { KetcherAPI } from "../../utils/ketcherFunctions";
import { getDeAromatizeSmile } from "./service";

const getHiddenButtonsConfig = (btnArr: string[]): ButtonsConfig => {
  return btnArr.reduce((acc: any, button: any) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {});
};

const structServiceProvider = new RemoteStructServiceProvider(
  process.env.NEXT_PUBLIC_INDIGO_SERVICE_API!
);

interface KetcherDrawBoxProps {
  reactionString?: string;
  keyIndex: number;
}
export default function KetcherDrawBox({ reactionString = "", keyIndex = 0 }: KetcherDrawBoxProps) {
  const [hiddenButtons] = useState(initiallyHidden);

  useEffect(() => {
    const updateMolecule = async () => {
      try {
        const ketcher = (global as any).ketcher as Ketcher;

        if (ketcher && reactionString) {
          const updatedSmile = await getDeAromatizeSmile(reactionString);
          ketcher.setMolecule(updatedSmile?.struct);
        }
      } catch (error) {
        console.log("Error loading molecule:", error);
      }
    };

    updateMolecule();
  }, [reactionString]);

  useEffect(() => {
    return () => {
      if ((global as any).ketcher) delete (global as any).ketcher;
      if ((global as any).KetcherFunctions) delete (global as any).KetcherFunctions;
    };
  }, []);

  return (
    <>
      <Editor
        key={keyIndex}
        staticResourcesUrl={process.env.NEXT_PUBLIC_ROOT_DIR || ""}
        buttons={getHiddenButtonsConfig(hiddenButtons)}
        structServiceProvider={structServiceProvider}
        errorHandler={(err: any) => console.log(err)}
        onInit={(ketcher: Ketcher) => {
          (global as any).ketcher = ketcher;
          (global as any).KetcherFunctions = KetcherAPI((global as any).ketcher);
          // ketcher.setSettings({ "general.dearomatize-on-load": 'true' })
          if (reactionString) {
            (async () => {
              try {
                const updatedSmile = await getDeAromatizeSmile(reactionString);
                ketcher.setMolecule(updatedSmile?.struct);
              } catch (error) {
                console.log("Error loading molecule:", error);
              }
            })();
          }
        }}
      />
    </>
  );
}