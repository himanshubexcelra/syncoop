import DataGrid, { Column } from 'devextreme-react/data-grid';
import { Button as Btn } from "devextreme-react/button";
import Image from 'next/image';
import Link from 'next/link';
import { CartItem, DeleteMoleculeCart } from '@/lib/definition';
import { submitOrder } from './libraryService';

interface CartDetailsProps {
    cartData: CartItem[];
    userId: number;
    removeItemFromCart: (item: DeleteMoleculeCart) => void;
    removeAll: (userId: number, type: string) => void;
}

export default function CartDetails({ cartData, userId, removeItemFromCart, removeAll }: CartDetailsProps) {
    interface CartDetail {
        id: number;
        moleculeId: number;
        libraryId: number;
        organizationId: number;
        projectId: number;
        molecular_weight: string;
        projectName: string;
        libraryName: string;
        moleculeName: string;
        userId: number;
    }

    interface OrderDetail {
        moleculeId: number;
        libraryId: number;
        projectId: number;
        organizationId: number;
        userId: number;
    }

    interface GroupedData {
        [key: string]: { id: number; moleculeId: number; molecularWeight: string; moleculeName: string; libraryId: number, projectId: number, userId: number }[];
    }

    const cartDetails: CartDetail[] = cartData.map(item => ({
        id: item.id,
        moleculeId: item.moleculeId,
        libraryId: item.libraryId,
        projectId: item.projectId,
        organizationId: item.organizationId,
        molecular_weight: item.molecule.molecular_weight,
        projectName: item.molecule.library.project.name,
        libraryName: item.molecule.library.name,
        moleculeName: item.molecule.source_molecule_name,
        userId: userId
    }));

    const orderDetails: OrderDetail[] = cartData.map(item => ({
        moleculeId: item.moleculeId,
        libraryId: item.libraryId,
        projectId: item.projectId,
        organizationId: item.organizationId,
        userId: userId
    }));

    const handleSubmitOrder = () => {
        submitOrder(orderDetails).then((res) => {
            if (res[0].orderId) {
                removeAll(userId, 'SubmitOrder')
            }
        })
            .catch((error) => {
                console.log(error);

            })
    }

    const groupedData = cartDetails.reduce((acc: GroupedData, item) => {
        const key = `${item.projectName}/${item.libraryName}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push({
            id: item.id,
            moleculeId: item.moleculeId,
            molecularWeight: item.molecular_weight,
            moleculeName: item.moleculeName,
            libraryId: item.libraryId,
            projectId: item.projectId,
            userId: item.userId
        });
        return acc;
    }, {});

    const formattedData = Object.entries(groupedData).map(([key, values]) => ({
        key,
        values
    }));

    return (
        <>
            {cartData.length > 0 ? (
                <div>
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
                                    cellRender={({ data }: any) => (
                                        <Btn
                                            render={() => (
                                                <Image
                                                    src="/icons/delete.svg"
                                                    width={24}
                                                    height={24}
                                                    alt="Remove"
                                                />
                                            )}
                                            onClick={() => removeItemFromCart(data)}
                                        />
                                    )}
                                    caption="Remove"
                                />
                            </DataGrid>
                        </div>
                    ))}
                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <Btn className='btn-primary' onClick={handleSubmitOrder} text="Submit Order" />
                        <Link href="#" onClick={() => removeAll(userId, 'RemoveAll')} className='text-themeBlueColor font-bold' style={{ marginLeft: '10px' }}>Remove All</Link>
                    </div>
                </div>
            ) : (
                <>No Items in the cart</>
            )}
        </>
    );
};
