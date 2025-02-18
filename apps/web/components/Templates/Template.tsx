"use client";

import { Button } from "devextreme-react";
import DataGrid, {
    Column,
} from "devextreme-react/data-grid";
import { useRef, useState } from 'react';
import { downloadSignedURL } from "./service";
import toast from "react-hot-toast";
import { delay } from "@/utils/helpers";
import { DELAY } from "@/utils/constants";

const Template = () => {
    // const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
    const [uploadType] = useState('');
    const [, setFiles] = useState({
        amsCatalogFile: '',
        reactionTemplateFile: '',
        bioAssayFile: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileData = [
        {
            name: 'AMS Catalog',
            latestFile: 'N/A',
            type: 'ams_catalog',
            isEnable:false
        },
        {
            name: 'Reaction Templates',
            latestFile: 'reaction_template',
            type: 'reaction_template',
            isEnable:true
        },
        {
            name: 'Bioassay Template',
            latestFile: 'bioassay',
            type: 'bioassay',
            isEnable:true
        },
    ];
    // const handleUpload = (fileName: string) => {
    //     setUploadType(fileName);
    //     if (fileInputRef.current) {
    //         fileInputRef.current.click();
    //     }

    // };

    const onDownloadClick = async (type: string) => {
        const data = await downloadSignedURL(type)
        if (data?.signed_url) {
            window.open(data.signed_url, '_blank');
        }
        else {
            const message = data?.detail || 'Download failed';
            const toastId = toast.error(message);
            await delay(DELAY);
            toast.remove(toastId);
        }
    };

    // const saveFiles = () => {
    //     console.log('Files saved');
    // }

    // const setReset = () => {
    //     console.log('Reset value set to ');
    // }

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            setFiles((prevFiles) => ({
                ...prevFiles,
                [uploadType]: file.name,
            }));
        }
    };


    // const buttonConfig = [
    //     {
    //         label: 'Save',
    //         class: 'primary-button disableButton',
    //         action: () => saveFiles(),
    //         loader: true,
    //     },
    //     {
    //         label: 'Cancel',
    //         class: 'secondary-button ml-[10px]',
    //         action: () => setReset(),
    //         loader: false,
    //     }
    // ]

    return (
        <div>
            {/* <div className='flex justify-end item-center p-4'>
                {buttonConfig.map((button, index) =>
                    <button key={index}
                        className={loadIndicatorVisible
                            ? 'disableButton w-[64px] h-[37px] ml-[10px]'
                            : button.class}
                        onClick={() => button.action()}
                        disabled={loadIndicatorVisible}>
                        <LoadIndicator className={
                            `button-indicator`
                        }
                            visible={button.loader && loadIndicatorVisible}
                            height={20}
                            width={20}
                        />
                        {(button.loader && loadIndicatorVisible)
                            ? ''
                            : button.label}
                    </button>
                )}
            </div> */}
            <DataGrid
                dataSource={fileData}
                showBorders={true}
                columnAutoWidth={true}
            >

                <Column dataField="name" caption="File" />
                <Column
                    caption="Action"
                    cellRender={({ data }) => (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {/* <Button
                                text="Upload"
                                onClick={() => handleUpload(data.type)}
                                className={`${styles['button-small']}`} /> */}
                            <Button
                                text="Download"
                                onClick={() => {
                                    onDownloadClick(data.type);
                                }}
                                className={data.isEnable ? "btn-secondary" : "btn-disable"}
                                disabled={!data.isEnable}
                            />
                        </div>
                    )}
                />
                <Column dataField="latestFile" caption="Latest File" />

            </DataGrid>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

        </div>
    )
}

export default Template