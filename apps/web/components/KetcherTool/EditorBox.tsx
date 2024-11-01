"use client"
import { useState } from 'react'
import { ButtonsConfig, Editor } from 'ketcher-react'
import { Ketcher } from 'ketcher-core'
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

/* const structServiceProvider = new RemoteStructServiceProvider(
    process.env.REACT_APP_API_PATH!,
    {
        'custom header': 'value' // optionally you can add custom headers object 
    }
) */

const structServiceProvider = new StandaloneStructServiceProvider();


export default function EditorBox() {
    /* const [outputValue, setOutputValue] = useState('') */
    const [hiddenButtons] = useState(initiallyHidden)
    const [editorKey] = useState('first-editor-key')

    // const sigmaStyle = { height: "500px", width: "500px" };
    return <>
        <Editor
            key={editorKey}
            staticResourcesUrl={process.env.NEXT_PUBLIC_ROOT_DIR || ''}
            buttons={getHiddenButtonsConfig(hiddenButtons)}
            structServiceProvider={structServiceProvider}
            errorHandler={(err) => console.log(err)}
            onInit={(ketcher: Ketcher) => {
                ; (global as any).ketcher = ketcher
                    ; (global as any).KetcherFunctions = KetcherAPI((global as any).ketcher)
            }}
        />
    </>
}