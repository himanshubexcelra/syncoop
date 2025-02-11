/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import DataGrid, {
    Column,
    Scrolling,
    Sorting,
    HeaderFilter,
    DataGridRef,
} from "devextreme-react/data-grid";
import Image from "next/image";
import { Button } from "devextreme-react/button";
import { MoleculeOrder } from "@/lib/definition";
import { useRef, useState } from "react";
import { LoadIndicator } from "devextreme-react";
import MoleculeStructureActions from "@/ui/MoleculeStructureActions";

type SendMoleculesForSynthesisProps = {
    moleculeData: MoleculeOrder[],
    inRetroData: MoleculeOrder[],
    generateReactionPathway: () => void,
    setSynthesisView: (val: boolean) => void,
    setDisableAnalysis: (val: boolean) => void,
    handleStructureZoom: (e: any, data: MoleculeOrder) => void,
    closeMagnifyPopup: (e: any) => void,
    removeSynthesisData: (val: MoleculeOrder) => void,
}

export default function SendMoleculesForSynthesis({
    moleculeData,
    inRetroData,
    generateReactionPathway,
    setSynthesisView,
    setDisableAnalysis,
    handleStructureZoom,
    closeMagnifyPopup,
    removeSynthesisData
}: SendMoleculesForSynthesisProps) {
    const [isLoading, setLoading] = useState(false);
    const grid = useRef<DataGridRef>(null);
    const confirmSynthesis = async () => {
        setLoading(true);
        setTimeout(() => {
            setSynthesisView(false);
            generateReactionPathway();
        }, 3000);
    }
    const [currentSort, setCurrentSort] = useState<{
        field: string | null;
        order: 'asc' | 'desc' | null
    }>({ field: null, order: null });

    const handleSortChanged = (e: any) => {
        // Only handle sorting-related changes
        if (e.name !== 'columns' || !e.fullName?.includes('sortOrder')) return;
        const dataGrid = grid.current?.instance();
        if (!dataGrid) return;
        const sortedColInfo = e.component.getVisibleColumns().
            filter((column: any) => column.sortOrder)?.[0]
        const newField = sortedColInfo?.dataField;
        // Get current sorting state
        const currentField = currentSort.field;
        const previousOrder = e.previousValue;
        const newOrder = e.value;

        if (currentField === newField) {
            if (newOrder === 'desc' && previousOrder === 'asc') {
                // Second click - already handled by DevExtreme
                setCurrentSort({ field: newField, order: 'desc' });
            } else if (previousOrder === 'desc') {
                // Third click - clear sorting
                dataGrid.clearSorting();
                setCurrentSort({ field: null, order: null });
            }
        } else {
            // New column clicked - DevExtreme handles the ascending sort
            setCurrentSort({ field: newField, order: 'asc' });
        }
    };

    const rawMoleculeData = moleculeData.map(item => ({
        ...item,
        molecular_weight: Number(item.molecular_weight).toFixed(2)
    }));

    return (
        <>
            {inRetroData.length > 0 &&
                <div>
                    {`${inRetroData.length} of your selected molecules have already 
                been sent for retrosynthesis`}
                </div>
            }
            <div className="mb-[20px] mt-[5px]">
                {`${rawMoleculeData.length} molecules will be sent for retrosynthesis.`}
            </div>
            <div className="mb-[20px] mt-[5px]">
                Estimated time 2 minutes.
            </div>
            <div onClick={closeMagnifyPopup}>
                <DataGrid
                    ref={grid}
                    dataSource={rawMoleculeData}
                    showBorders={true}
                    columnAutoWidth={false}
                    width="100%"
                    style={{ maxHeight: '480px' }}
                    onOptionChanged={handleSortChanged}
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
                        cellRender={({ data }) => (
                            <Button
                                onClick={() => { removeSynthesisData(data) }}
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
                        setDisableAnalysis(false)
                        closeMagnifyPopup(true)
                    }}
                />
            </div>
        </>
    );
}