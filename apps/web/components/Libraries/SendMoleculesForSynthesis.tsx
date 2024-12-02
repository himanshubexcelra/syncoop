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
import dynamic from 'next/dynamic';
import { useState } from "react";
import { LoadIndicator } from "devextreme-react";

type SendMoleculesForSynthesisProps = {
    moleculeData: MoleculeOrder[],
    inRetroData: MoleculeOrder[],
    generateReactionPathway: () => void,
    setSynthesisView: (val: boolean) => void
}

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

export default function SendMoleculesForSynthesis({
    moleculeData,
    inRetroData,
    generateReactionPathway,
    setSynthesisView,
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
                Estimated time xx minutes.
            </div>
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
                    minWidth={300}
                    allowHeaderFiltering={false}
                    cellRender={({ data, rowIndex }) => (
                        <span className='flex justify-center gap-[7.5px]'
                        >
                            <MoleculeStructure
                                structure={data.smiles_string}
                                id={`smiles-${rowIndex}`}
                                width={80}
                                height={80}
                                svgMode={true}
                            />
                            <Button
                                disabled={true}
                                render={() => (
                                    <>
                                        <Image
                                            src="/icons/edit.svg"
                                            width={24}
                                            height={24}
                                            alt="edit"
                                        />
                                    </>
                                )}

                            />
                            <Button
                                disabled={true}
                                render={() => (
                                    <>
                                        <Image
                                            src="/icons/zoom.svg"
                                            width={24}
                                            height={24}
                                            alt="zoom"
                                        />
                                    </>
                                )}
                            />
                            <Button
                                disabled={true}
                                render={() => (
                                    <>
                                        <Image
                                            src="/icons/delete.svg"
                                            width={24}
                                            height={24}
                                            alt="delete"
                                        />
                                    </>
                                )}
                            />

                        </span>
                    )} />

                <Column
                    dataField="molecular_weight"
                    caption="Weight"
                    alignment="center"
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
            <div className="mt-[20px] flex gap-[20px]">
                <button className="primary-button"
                    onClick={confirmSynthesis}
                >
                    <LoadIndicator
                        visible={isLoading}
                        height={20}
                        width={20} />
                    {isLoading ? '' : 'Confirm'} </button>
                <Button
                    text="Cancel"
                    type="normal"
                    stylingMode="contained"
                    elementAttr={{ class: "btn-secondary" }}
                />
            </div>
        </>
    );
}