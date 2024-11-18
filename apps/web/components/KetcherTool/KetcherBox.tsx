"use client"
import { useEffect, useState } from 'react'
import { ButtonsConfig, Editor } from 'ketcher-react'
import { Ketcher } from 'ketcher-core'
// @ts-expect-error Missing declaration types
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import 'ketcher-react/dist/index.css'
import { initiallyHidden } from './constants/buttons'
import { KetcherAPI } from '../../utils/ketcherFunctions'

const getHiddenButtonsConfig = (btnArr: string[]): ButtonsConfig => {
  return btnArr.reduce((acc: any, button: any) => {
    if (button) acc[button] = { hidden: true }

    return acc
  }, {})
}

const structServiceProvider = new StandaloneStructServiceProvider();

interface KetcherDrawBoxProps {
  reactionString?: string;
}
export default function KetcherDrawBox({ reactionString = '' }: KetcherDrawBoxProps) {
  const [hiddenButtons] = useState(initiallyHidden)
  const [editorKey] = useState('first-editor-key')

  useEffect(() => {
    if ((global as any).KetcherFunctions && reactionString) {
      (global as any).KetcherFunctions.renderFromCtab(reactionString);
    }
  }, [reactionString]);

  useEffect(() => {
    return () => {
      if ((global as any).ketcher) delete (global as any).ketcher;
      if ((global as any).KetcherFunctions) delete (global as any).KetcherFunctions;
    };
  }, []);

  return <>
    <Editor
      key={editorKey}
      staticResourcesUrl={process.env.NEXT_PUBLIC_ROOT_DIR || ''}
      buttons={getHiddenButtonsConfig(hiddenButtons)}
      structServiceProvider={structServiceProvider}
      errorHandler={(err: any) => console.log(err)}
      onInit={(ketcher: Ketcher) => {
        ; (global as any).ketcher = ketcher
          ; (global as any).KetcherFunctions = KetcherAPI((global as any).ketcher)
        if (reactionString) {
          (global as any).KetcherFunctions.renderFromCtab(reactionString);
        }
      }}
    />
  </>
}