/*eslint max-len: ["error", { "code": 100 }]*/
import CustomDataGrid from '@/ui/dataGrid';
import { Button as Btn } from "devextreme-react/button";
import Image from 'next/image';
import Link from 'next/link';
import {
  CartItem,
  DeleteMoleculeCart,
  CartDetail,
  OrderType,
  ColumnConfig,
  OrganizationType
} from '@/lib/definition';
import { submitOrder } from './service';
import dynamic from 'next/dynamic';
interface CartDetailsProps {
  cartData: CartItem[];
  user_id: number;
  orgType: string;
  removeItemFromCart: (item: DeleteMoleculeCart) => void;
  removeAll: (user_id: number, type: string) => void;
}
export default function CartDetails({
  cartData,
  user_id,
  orgType,
  removeItemFromCart,
  removeAll
}: CartDetailsProps) {
  const MoleculeStructure = dynamic(() => import('@/utils/MoleculeStructure'), { ssr: false });
  const cartDetails: CartDetail[] = cartData.map(item => ({
    id: item.id,
    molecule_id: item.molecule_id,
    library_id: item.library_id,
    project_id: item.project_id,
    organization_id: item.organization_id,
    molecular_weight: item.molecule.molecular_weight,
    moleculeName: item.molecule.source_molecule_name,
    smiles_string: item.molecule.smiles_string,
    created_by: user_id,
    "project / library": `${item.molecule.library.project.name} / ${item.molecule.library.name}`,
    "organization / order": `${item.organization.name} / ${item.order_id}`
  }));

  const columns: ColumnConfig<CartDetail>[] = [
    {
      dataField: 'molecule_id',
      title: 'Molecule ID',
      width: 125,
      customRender: (data) => (
        <span className="flex justify-start">
          {data.molecule_id}
        </span>
      ),
    },
    {
      dataField: 'smiles_string',
      title: 'Structure',
      width: 110,
      customRender: (data) => (
        <span className="flex justify-start items-center">
          <MoleculeStructure height={80} width={80} svgMode={true}
            structure={data.smiles_string} id={`smiles-${data.id}`} />
        </span>

      ),
    },
    { dataField: 'molecular_weight', title: 'Weight', width: 100 },
    {
      dataField: 'id',
      title: 'Remove',
      width: 24,
      customRender: (data) => (
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
      ),
    },
  ];
  const rowGroupName = () => {
    if (orgType === OrganizationType.External) {
      return "project / library"
    }
    else {
      return "organization / order";
    }
  }

  const handleSubmitOrder = () => {
    const orderDetails: OrderType[] = cartData.map(item => ({
      order_id: Number(item.order_id),
      order_name: `Order${item.order_id}`,
      molecule_id: item.molecule_id,
      library_id: item.library_id,
      project_id: item.project_id,
      organization_id: item.organization_id,
      created_by: user_id,
    }));
    
    submitOrder(orderDetails).then((res) => {
      if (res[0].order_id) {
        removeAll(user_id, 'SubmitOrder')
      }
    })
      .catch((error) => {
        console.log(error);
      })
  }
  return (
    <>
      {cartData.length > 0 ? (
        <div style={{ height: '500px' }}>
          <div className="popup-content">
            <div className="popup-grid">
              <CustomDataGrid
                columns={columns}
                data={cartDetails}
                groupingColumn={rowGroupName()}
                enableGrouping
                enableInfiniteScroll={false}
                enableSorting={false}
                enableFiltering={false}
                enableOptions={false}
                enableRowSelection={false}
                enableSearchOption={false}
                loader={false}
              />
            </div>

            <div className="popup-buttons">
              <Btn
                className="btn-primary"
                onClick={() => {
                  if (orgType === OrganizationType.External) {
                    handleSubmitOrder();
                  }
                }}
                disabled={orgType === OrganizationType.External ? false : true}
                text="Submit Order"
              />
              <Link
                href="#"
                onClick={() => removeAll(user_id, 'RemoveAll')}
                className="text-themeBlueColor font-bold"
                style={{ marginLeft: '10px', marginTop: '10px' }}
              >
                Remove All
              </Link>
            </div>
          </div>
        </div>


      ) : (
        <>No Items in the cart</>
      )}
    </>
  );
} 