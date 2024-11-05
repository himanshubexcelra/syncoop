/*eslint max-len: ["error", { "code": 100 }]*/
import DataGrid, { Column } from 'devextreme-react/data-grid';
import { Button as Btn } from "devextreme-react/button";
import Image from 'next/image';
import Link from 'next/link';
import {
    CartItem,
    DeleteMoleculeCart,
    CartDetail,
    OrderDetail,
    GroupedData
} from '@/lib/definition';
import { submitOrder } from './libraryService';
import { generateRandomDigitNumber } from '@/utils/helpers';
interface CartDetailsProps {
    cartData: CartItem[];
    userId: number;
    removeItemFromCart: (item: DeleteMoleculeCart) => void;
    removeAll: (userId: number, type: string) => void;
}

export default function CartDetails({
    cartData,
    userId,
    removeItemFromCart,
    removeAll
}: CartDetailsProps) {

    const cartDetails: CartDetail[] = cartData.map(item => ({
        id: item.id,
        moleculeId: item.moleculeId,
        library_id: item.library_id,
        project_id: item.project_id,
        organization_id: item.organization_id,
        molecular_weight: item.molecule.molecular_weight,
        projectName: item.molecule.library.project.name,
        libraryName: item.molecule.library.name,
        moleculeName: item.molecule.source_molecule_name,
        created_by: userId
    }));

    const orderId = generateRandomDigitNumber();
    const orderName = `Order${orderId}`
    const orderDetails: OrderDetail[] = cartData.map(item => ({
        orderId: Number(orderId),
        orderName: orderName,
        moleculeId: item.moleculeId,
        library_id: item.library_id,
        project_id: item.project_id,
        organization_id: item.organization_id,
        created_by: userId,
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
            library_id: item.library_id,
            project_id: item.project_id,
            created_by: userId
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
                        <Btn
                            className='btn-primary'
                            onClick={handleSubmitOrder}
                            text="Submit Order" />
                        <Link href="#"
                            onClick={() =>
                                removeAll(userId, 'RemoveAll')}
                            className='text-themeBlueColor font-bold'
                            style={{ marginLeft: '10px' }
                            }>Remove All</Link>
                    </div>
                </div>
            ) : (
                <>No Items in the cart</>
            )}
        </>
    );
} 
