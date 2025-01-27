
/*eslint max-len: ["error", { "code": 100 }]*/
import { useRef, useState } from "react";
import CustomDataGrid from "@/ui/dataGrid";
import ConfirmationDialog from "./ConfirmationDialog";
import { Button as Btn } from "devextreme-react/button";
import Image from "next/image";
import Link from "next/link";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {
  CartItem,
  DeleteMoleculeCart,
  CartDetail,
  OrderType,
  ColumnConfig,
  SaveLabJobOrder,
  UserData,
  CellData,
  Pathway,
  ReactionLabJobOrder
} from "@/lib/definition";
import { submitOrder, getLabJobOrderDetail, postLabJobOrder, updateLabJobApi } from "./service";
import dynamic from "next/dynamic";
import { generateRandomDigitNumber } from "@/utils/helpers";
import toast from "react-hot-toast";
import { Messages } from "@/utils/message";
import { LabJobStatus, ReactionStatus } from "@/utils/constants";
import MoleculeStructureActions from "@/ui/MoleculeStructureActions";

interface CartDetailsProps {
  cartData: CartItem[];
  userData: UserData;
  containsProjects: boolean;
  removeItemFromCart: (item: DeleteMoleculeCart) => void;
  removeAll: (user_id: number, type: string, msg: string) => void;
  close: () => void;
  loader: boolean
}
export default function CartDetails({
  cartData,
  userData,
  containsProjects,
  removeItemFromCart,
  removeAll,
  close,
  loader,
}: CartDetailsProps) {
  const [isDisable, setDisableButton] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
  const [cellData, setCellData] = useState<CellData>({
    smiles_string: "",
    source_molecule_name: ''
  });
  const [isSubmitOrderLoading, setSubmitOrderLoading] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  const closeMagnifyPopup = (event: any) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setPopupVisible(false);
    }
  };
  const MoleculeStructure = dynamic(() => import("@/utils/MoleculeStructure"), {
    ssr: false,
  });
  
  const cartDetails: CartDetail[] = cartData.map((item) => {
    return {
    id: item.id,
    molecule_id: item.molecule_id,
    library_id: item.library_id,
    project_id: item.project_id,
    molecule_order_id: item.molecule_order_id,
    organization_id: item.organization_id,
    molecular_weight: item.molecule.molecular_weight,
    moleculeName: item.molecule.source_molecule_name,
    smiles_string: item.molecule.smiles_string,
    created_by: userData.id,
    "Project / Library": `${item.molecule.project.name} / ${item.molecule.library.name}`,
    "Organization / Order": `${item.organization.name} / ${item.molecule_order_id}`,
  }});

  const handleStructureZoom = (event: any, data: any) => {
    const { x, y } = event.event.target.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    setPopupCords({ x, y: y >= screenHeight / 2 ? y - 125 : y });
    setPopupVisible(true);
    setCellData({ ...data, source_molecule_name: data.moleculeName });
  }

  const columns: ColumnConfig[] = [
    {
      dataField: "molecule_id",
      title: "Molecule ID",
      width: 120,
      customRender: (data) => (
        <span className="flex justify-start">{data.molecule_id}</span>
      ),
    },
    {
      dataField: 'smiles_string',
      title: 'Structure',
      minWidth: 80,
      width: 140,
      allowHeaderFiltering: false,
      allowSorting: false,
      customRender: (data) => (
        <MoleculeStructureActions
          smilesString={data.smiles_string}
          molecule_id={data.molecule_id}
          structureName={data.moleculeName}
          onZoomClick={(e: any) => {
            e.event.stopPropagation();
            handleStructureZoom(e, data);
          }}
        />
      ),
    },
    {
      dataField: 'molecular_weight',
      title: 'Molecular Weight',
      width: 120,
      alignment: 'center',
      allowHeaderFiltering: false,
      customRender: (data) => Number(data.molecular_weight).toFixed(2)
    },
    {
      title: "Remove",
      width: 24,
      allowHeaderFiltering: false,
      allowSorting: false,
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
    if (containsProjects) {
      return "Project / Library";
    } else {
      return "Organization / Order";
    }
  };

  const handleSubmitOrder = () => {
    const ordered_molecules = cartData.map((item) => item.molecule_id);
    const order_id = generateRandomDigitNumber();
    const orderDetails: OrderType = {
      order_id: order_id,
      order_name: `Order${order_id}`,
      ordered_molecules: ordered_molecules,
      organization_id: cartData[0].organization_id,
      created_by: userData.id,
      status: LabJobStatus.Submitted,
      reactionStatus: ReactionStatus.InProgress,
    };

    submitOrder(orderDetails)
      .then((res) => {
        if (res) {
          removeAll(userData.id, "SubmitOrder", Messages.SUBMIT_ORDER);
          setSubmitOrderLoading(true);
        }
      })
      .catch((error) => {
        toast.error(error);
        setDisableButton(false);
        setSubmitOrderLoading(true);
      });
  };

  const prePareReactions = (reactionData: Pathway) => {
    const result: ReactionLabJobOrder[] = [];
    reactionData.reaction_detail.map((reaction_detail: any) => {
      reaction_detail.reaction_compound.map((reaction_compound: any) => {
        if (reaction_compound.compound_type === "R") {
          const reaction_compound_number = reaction_compound.compound_label - 1;
          const reagentLabel = String.fromCharCode(65 + reaction_compound_number);
          const obj: ReactionLabJobOrder = {
            "Solvent": reaction_detail.solvent,
            "Step No": reaction_compound.compound_label,
            "Product MW": reaction_detail.product_molecular_weight,
            "Product 1 SMILES": reaction_detail.product_smiles_string,
            [`Reagent ${reagentLabel} SMILES`]: reaction_compound.smiles_string,
            [`Reagent ${reagentLabel} molar ratio`]: reaction_compound.molar_ratio,
            [`Reagent ${reagentLabel} dispense time`]: reaction_compound.dispense_time,
          }
          result.push(obj)
        }
      })
    })
    return result;
  }

  const prepareLabJobData = (
    res: any,
    moleculeId: number
  ): SaveLabJobOrder[] => {
    const totalReaction: number = res.pathway[0].reaction_detail?.length ?? 0;
    const finalProduct =
      res.pathway?.[0]?.reaction_detail?.[totalReaction - 1] ?? null;
    const organization = res?.organization;
    const reactionData = prePareReactions(res.pathway[0])

    const labJobData: SaveLabJobOrder[] = [
      {
        molecule_id: moleculeId ? Number(moleculeId) : 0,
        pathway_id: Number(res.pathway[0].id),
        product_smiles_string: finalProduct?.product_smiles_string,
        product_molecular_weight: finalProduct?.product_molecular_weight,
        no_of_steps: res?.pathway[0].step_count,
        functional_bioassays: organization.metadata,
        reactions: reactionData,
        created_by: userData.id,
        status: LabJobStatus.Submitted,
        reactionStatus: ReactionStatus.InProgress,
      },
    ];
    return labJobData;
  };

  const getLabJobOrderData = async () => {
    setSubmitOrderLoading(true);
    const labJobDataList: SaveLabJobOrder[] = [];
    await Promise.all(
      cartData.map(async (item: any) => {
        const res = await getLabJobOrderDetail(item.molecule_id);
        const labJobData: SaveLabJobOrder[] = prepareLabJobData(res, item.molecule_id);
        labJobDataList.push(...labJobData);
      })
    );
    return labJobDataList;
  };

  async function processLabJobOrders(labJobOrderData: SaveLabJobOrder[]) {
    for (const item of labJobOrderData) {
      try {
        const result = await postLabJobOrder(item);
        await updateLabJobApi(result.lab_job_order_id);
        removeAll(
          userData.id,
          "LabJobOrder",
          Messages.displayLabJobMessage(cartData.length)
        );
      } catch (error) {
        console.error("Error processing lab job order:", error);
      }
    }
  }


  const handleLabJobOrder = async () => {
    const labJobOrderData = await getLabJobOrderData();
    processLabJobOrders(labJobOrderData);
  };

  const handleClick = () => {
    if (containsProjects) {
      handleSubmitOrder();
    } else {
      setConfirm(true);
    }
  };

  const handleCancel = (val: boolean) => {
    setConfirm(val);
  };

  return (

    <>
      {
        loader ? <div style={{ marginTop: '300px', marginLeft: '255px' }}><LoadIndicator /></div>
          : cartData.length > 0 ? (
            <div className="popup-content">
              <div className="popup-grid"
                onClick={closeMagnifyPopup}>
                <CustomDataGrid
                  columns={columns}
                  data={cartDetails}
                  groupingColumn={rowGroupName()}
                  enableGrouping
                  enableSorting={false}
                  enableFiltering={false}
                  enableOptions={false}
                  enableRowSelection={false}
                  enableSearchOption={false}
                  loader={false}
                  scrollMode={'infinite'}
                />
              </div>

              <div className="popup-buttons">
                <Btn
                  className={
                    isSubmitOrderLoading
                      ? "mol-ord-btn-disable btn-primary w-[130px]"
                      : "btn-primary w-[130px]"
                  }
                  disabled={isDisable || isSubmitOrderLoading}
                  onClick={handleClick}
                  text={isSubmitOrderLoading ? '' : 'Submit Order'}

                >
                  {isSubmitOrderLoading && (
                    <LoadIndicator
                      className="button-indicator"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'var(--themeSilverGreyColor)'
                      }}
                      height={20}
                      width={20}
                    />
                  )}
                </Btn>
                <Btn
                  className="btn-secondary"
                  onClick={() => {
                    close();
                    setSubmitOrderLoading(false);
                  }}
                  text="Close"
                />
                <Link
                  href="#"
                  onClick={() =>
                    removeAll(userData.id, "RemoveAll", Messages.REMOVE_ALL_MESSAGE)
                  }
                  className="text-themeBlueColor font-bold"
                  style={{ marginLeft: "10px", marginTop: "10px" }}
                >
                  Remove All
                </Link>
              </div>
            </div>
          ) : (
            <>No Items in the cart</>
          )}
      {confirm && (
        <ConfirmationDialog
          onSave={handleLabJobOrder}
          openConfirmation={confirm}
          setConfirm={(e: any) => handleCancel(e)}
          msg={Messages.displayLabJobMessage(cartData.length)}
          title={Messages.LAP_JOB_CONFIRMATION_TITLE}
        />
      )}
      {popupVisible && (
        <div
          ref={popupRef}
          style={{
            top: `${popupCords.y}px`,
            right: `-120px`,
            zIndex: 2000,
          }}
          className="fixed
                                transform -translate-x-1/2 -translate-y-1/2
                                bg-gray-100
                                bg-opacity-80
                                w-[250px]
                                h-[250px]"
        >
          <div
            className="absolute
                                    top-1/2
                                    left-1/2
                                    transform -translate-x-1/2 -translate-y-1/2"
          >
            <MoleculeStructure
              structure={cellData.smiles_string}
              width={200}
              height={200}
              svgMode={true}
              structureName={cellData.source_molecule_name}
            />
          </div>
        </div>
      )}
    </>
  );
}