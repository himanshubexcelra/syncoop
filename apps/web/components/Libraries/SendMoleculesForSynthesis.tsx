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
import { MoleculeType } from "@/lib/definition";

type SendMoleculesForSynthesisProps = {
    moleculeData: MoleculeType[],
}

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
                    cellRender={() => (
                        <span className='flex justify-center gap-[7.5px]'>
                            <Image
                                src="/icons/libraries.svg"
                                width={24}
                                height={24}
                                alt="Create"
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