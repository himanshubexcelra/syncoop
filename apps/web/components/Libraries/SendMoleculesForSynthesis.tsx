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

type SendMoleculesForSynthesisProps = {
    moleculeData: MoleculeOrder[],
}

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

export default function SendMoleculesForSynthesis({
    moleculeData,
}: SendMoleculesForSynthesisProps) {

    return (
        <>
            <div>4 of your selected molecules have already been sent for retrosynthesis</div>
            <div className="mb-[20px] mt-[5px]">Estimated time xx minutes.</div>
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
                    dataField="id"
                    caption="Molecule ID"
                    alignment="center"
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
                <Button
                    text="Confirm"
                    type="normal"
                    stylingMode="contained"
                    elementAttr={{ class: "btn-primary" }}
                />
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