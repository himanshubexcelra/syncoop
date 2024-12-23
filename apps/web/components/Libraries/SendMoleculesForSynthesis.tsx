/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import DataGrid, {
    Column,
    Scrolling,
    Sorting,
    HeaderFilter,
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Button } from "devextreme-react/button";
import { MoleculeOrder } from "@/lib/definition";
import { useState } from "react";
import { LoadIndicator } from "devextreme-react";
import MoleculeStructureActions from "@/ui/MoleculeStructureActions";

type SendMoleculesForSynthesisProps = {
    moleculeData: MoleculeOrder[],
    inRetroData: MoleculeOrder[],
    generateReactionPathway: () => void,
    setSynthesisView: (val: boolean) => void,
    handleStructureZoom: (e: any, data: MoleculeOrder) => void,
    closeMagnifyPopup: (e: any) => void,
}

export default function SendMoleculesForSynthesis({
    moleculeData,
    inRetroData,
    generateReactionPathway,
    setSynthesisView,
    handleStructureZoom,
    closeMagnifyPopup,
}: SendMoleculesForSynthesisProps) {

    const [isLoading, setLoading] = useState(false);

    const confirmSynthesis = async () => {
        setLoading(true);
        setTimeout(() => {
            setSynthesisView(false);
            generateReactionPathway();
        }, 3000);
    }

    return (
        <>
            {inRetroData.length > 0 &&
                <div>
                    {`${inRetroData.length} of your selected molecules have already 
                been sent for retrosynthesis`}
                </div>
            }
            <div className="mb-[20px] mt-[5px]">
                {`${moleculeData.length} molecules will be sent for retrosynthesis.`}
            </div>
            <div className="mb-[20px] mt-[5px]">
                Estimated time 2 minutes.
            </div>
            <div onClick={closeMagnifyPopup}>
                <DataGrid
                    dataSource={moleculeData}
                    showBorders={true}
                    columnAutoWidth={false}
                    width="100%"
                >
                    <Sorting mode="single" />
                    <Scrolling mode="infinite" />
                    <HeaderFilter visible={true} />
                    <Column
                        dataField="molecule_id"
                        caption="Molecule ID"
                        alignment="center"
                        minWidth={150}
                    />
                    <Column dataField="Structure"
                        minWidth={160}
                        allowHeaderFiltering={false}
                        alignment="center"
                        cellRender={({ data }) => (
                            <span className='flex justify-center gap-[7.5px]'
                            >
                                <MoleculeStructureActions
                                    smilesString={data.smiles_string}
                                    molecule_id={data.molecule_id}
                                    onZoomClick={(e: any) => {
                                        handleStructureZoom(e, data);
                                    }}
                                    structureName={data.source_molecule_name}
                                />
                            </span>
                        )} />

                    <Column
                        dataField="molecular_weight"
                        caption="Molecular Weight"
                        alignment="center"
                        minWidth={120}
                        cellRender={({ data }) => Number(data.molecular_weight).toFixed(2)}
                    />
                    <Column
                        cellRender={() => (
                            <Button
                                render={() => (
                                    <>
                                        <Image
                                            src="/icons/delete.svg"
                                            width={24}
                                            height={24}
                                            alt="Delete Molecule"
                                        />
                                    </>
                                )}
                            />
                        )}
                        caption="Remove"
                    />
                </DataGrid>
            </div>
            <div className="mt-[20px] flex gap-[20px]">
                <button className={isLoading
                    ? 'disableButton w-[68px]'
                    : 'primary-button'}
                    onClick={confirmSynthesis}
                >
                    <LoadIndicator className="button-indicator"
                        visible={isLoading}
                        height={20}
                        width={20} />
                    {isLoading ? '' : 'Confirm'} </button>
                <Button
                    text="Cancel"
                    type="normal"
                    stylingMode="contained"
                    elementAttr={{ class: "btn-secondary" }}
                    onClick={() => {
                        setSynthesisView(false)
                        closeMagnifyPopup(true)
                    }}
                />
            </div>
        </>
    );
}