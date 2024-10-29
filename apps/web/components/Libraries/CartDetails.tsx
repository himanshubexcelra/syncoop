
import DataGrid, { Column } from 'devextreme-react/data-grid';
import { Button as Btn } from "devextreme-react/button";
import Image from "next/image";

export default function CartDetails({ cartData }) {
    interface CartDetail {
        moleculeId: number;
        libraryId: number;
        molecular_weight: string;
        projectName: string;
        libraryName: string;
        moleculeName: string;
    }
    interface GroupedData {
        [key: string]: { moleculeId: number; molecularWeight: string; moleculeName: string }[];
    }



    const cartDetails: CartDetail[] = cartData.map(item => ({
        moleculeId: item.moleculeId,
        libraryId: item.libraryId,
        molecular_weight: item.molecule.molecular_weight,
        projectName: item.molecule.library.project.name,
        libraryName: item.molecule.library.name,
        moleculeName: item.molecule.source_molecule_name
    }));

    const removeItemFromCart = () => {

    }
    const groupedData = cartDetails.reduce((acc: GroupedData, item) => {
        const key = `${item.projectName}/${item.libraryName}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push({
            moleculeId: item.moleculeId,
            molecularWeight: item.molecular_weight,
            moleculeName: item.moleculeName
        });
        return acc;
    }, {});

    const formattedData = Object.entries(groupedData).map(([key, values]) => ({
        key,
        values
    }));


    return (
        <>
            {formattedData.map((group) => (
                <div key={group.key}>
                    <div className='accordion-title'>{group.key}</div>
                    <DataGrid
                        dataSource={group.values}
                        showBorders={true}
                    >
                        <Column dataField="moleculeName" caption="Molecule Name" />
                        <Column dataField="moleculeId" caption="MoleculeID" />
                        <Column dataField="molecularWeight" caption="MoleculeWeight" />
                        <Column
                            width={80}
                            cellRender={({ group }: any) => (
                                <Btn
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/delete.svg"
                                                width={24}
                                                height={24}
                                                alt="Create"
                                            />
                                        </>
                                    )}
                                    onClick={() => removeItemFromCart(group)}
                                />
                            )}
                            caption="Remove"
                        />
                    </DataGrid>
                </div>
            ))}
        </>
    );
}