/*eslint max-len: ["error", { "code": 100 }]*/
import { useState } from 'react';
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
  OrganizationType,
  SaveLabJobOrder
} from '@/lib/definition';
import { submitOrder, getLabJobOrderDetail, postLabJobOrder } from './service';
import dynamic from 'next/dynamic';
import { generateRandomDigitNumber } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { Messages } from '@/utils/message';

interface CartDetailsProps {
  cartData: CartItem[];
  user_id: number;
  orgType: string;
  removeItemFromCart: (item: DeleteMoleculeCart) => void;
  setCreatePopupVisibility: (value: boolean) => void;
  removeAll: (user_id: number, type: string, msg: string) => void;
}
export default function CartDetails({
  cartData,
  user_id,
  orgType,
  removeItemFromCart,
  removeAll,
  setCreatePopupVisibility
}: CartDetailsProps) {

  const [isDisable, setDisableButton] = useState(false)
  const MoleculeStructure = dynamic(() => import('@/utils/MoleculeStructure'), { ssr: false });
  const cartDetails: CartDetail[] = cartData.map(item => ({
    id: item.id,
    molecule_id: item.molecule_id,
    library_id: item.library_id,
    project_id: item.project_id,
    molecule_order_id: item.molecule_order_id,
    organization_id: item.organization_id,
    molecular_weight: item.molecule.molecular_weight,
    moleculeName: item.molecule.source_molecule_name,
    smiles_string: item.molecule.smiles_string,
    created_by: user_id,
    "project / library": `${item.molecule.project.name} / ${item.molecule.library.name}`,
    "organization / order": `${item.organization.name} / ${item.molecule_order_id}`
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
      dataField: 'molecular_weight',
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
    setDisableButton(true);
    const batch_detail = {
      total_ordered_molecules: cartData.map(item => item.id)
    };
    const orderDetails: OrderType[] = cartData.map(item => {
      const order_id = generateRandomDigitNumber();
      return {
        order_id: order_id,
        order_name: `Order${order_id}`,
        molecule_id: item.molecule_id,
        library_id: item.library_id,
        project_id: item.project_id,
        batch_detail: JSON.stringify(batch_detail),
        organization_id: item.organization_id,
        created_by: user_id,
      };
    });
    submitOrder(orderDetails).then((res) => {
      if (res[0].order_id) {
        removeAll(user_id, 'SubmitOrder', Messages.SUBMIT_ORDER)
        setDisableButton(false)
      }
    })
      .catch((error) => {
        console.log(error);
      })
  }
  const prepareLabJobData = (res: any, moleculeId: number): SaveLabJobOrder[] => {
    const totalReaction: number = res.pathway[0].reaction_detail?.length ?? 0;
    const finalProduct = res.pathway?.[0]?.reaction_detail?.[totalReaction - 1] ?? null;
    const organization = res?.organization;
    const labJobData: SaveLabJobOrder[] = [{
      molecule_id: moleculeId ? moleculeId : 0,
      pathway_id: res?.pathway[0].id,
      pathway_instance_id: res?.pathway[0].pathway_instance_id,
      product_smiles_string: finalProduct?.product_smiles_string,
      product_molecular_weight: finalProduct?.product_molecular_weight,
      no_of_steps: res?.pathway[0].step_count,
      functional_bioassays: organization.metadata,
      reactions: res.pathway[0] ? JSON.stringify(res.pathway[0].reaction_detail) : '',
      created_by: user_id
    }];
    return labJobData;
  }
  const handleLabJobOrder = () => {
    setDisableButton(true)
    cartData.map((item: any) => {
      getLabJobOrderDetail(item.molecule_id)
        .then((res) => {
          const labJobData: SaveLabJobOrder[] = prepareLabJobData(res, item.molecule_id);
          postLabJobOrder(labJobData[0])
            .then(() => {
              removeAll(user_id, 'SubmitOrder', Messages.displayLabJobMessage(cartData.length))
              setDisableButton(false)
            })
            .catch((err) => {
              toast.error(err)
            })
        })
    })
  }
  return (
    <>
      {cartData.length > 0 ? (
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
              disabled={isDisable}
              onClick={() => {
                if (orgType === "CO") {
                  handleSubmitOrder();
                }
                else {
                  handleLabJobOrder();
                }
              }}

              text="Submit Order"
            />
            <Btn
              className="btn-secondary"
              onClick={() => { setCreatePopupVisibility(false) }}
              text="Cancel"
            />
            <Link
              href="#"
              onClick={() => removeAll(user_id, 'RemoveAll', Messages.REMOVE_ALL_MESSAGE)}
              className="text-themeBlueColor font-bold"
              style={{ marginLeft: '10px', marginTop: '10px' }}
            >
              Remove All
            </Link>
          </div>
        </div>
      ) : (
        <>No Items in the cart</>
      )}
    </>
  );
} 