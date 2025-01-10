
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
} from "@/lib/definition";
import { submitOrder, getLabJobOrderDetail, postLabJobOrder } from "./service";
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
    setCellData({
      smiles_string: "",
      source_molecule_name: ''
    })
  };
  const MoleculeStructure = dynamic(() => import("@/utils/MoleculeStructure"), {
    ssr: false,
  });
  const cartDetails: CartDetail[] = cartData.map((item) => ({
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
  }));

  const handleStructureZoom = (event: any, data: any) => {
    const x = event.clientX;
    const y = event.clientY;
    const screenHeight = event.view.innerHeight;
    if (!popupVisible) {
      setPopupCords({ x, y: y >= screenHeight / 2 ? y - 125 : y });
      setPopupVisible(true);
      setCellData({ ...data, source_molecule_name: data.moleculeName });
    }
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
        <div onMouseEnter={(e) => handleStructureZoom(e, data)}>
          <MoleculeStructureActions
            smilesString={data.smiles_string}
            molecule_id={data.molecule_id}
            structureName={data.moleculeName}
            onZoomClick={(e: any) => {
              e.event.stopPropagation();
              handleStructureZoom(e, data);
            }}
          />
        </div>
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

  const prepareLabJobData = (
    res: any,
    moleculeId: number
  ): SaveLabJobOrder[] => {
    const totalReaction: number = res.pathway[0].reaction_detail?.length ?? 0;
    const finalProduct =
      res.pathway?.[0]?.reaction_detail?.[totalReaction - 1] ?? null;
    const organization = res?.organization;
    const labJobData: SaveLabJobOrder[] = [
      {
        molecule_id: moleculeId ? Number(moleculeId) : 0,
        pathway_id: Number(res.pathway[0].id),
        product_smiles_string: finalProduct?.product_smiles_string,
        product_molecular_weight: finalProduct?.product_molecular_weight,
        no_of_steps: res?.pathway[0].step_count,
        functional_bioassays: organization.metadata,
        reactions: res.pathway[0]
          ? JSON.stringify(res.pathway[0].reaction_detail)
          : "",
        created_by: userData.id,
        status: LabJobStatus.Submitted,
        reactionStatus: ReactionStatus.InProgress,
      },
    ];
    return labJobData;
  };

  const handleLabJobOrder = () => {
    cartData.map((item: any) => {
      getLabJobOrderDetail(item.molecule_id).then((res) => {
        const labJobData: SaveLabJobOrder[] = prepareLabJobData(
          res,
          item.molecule_id
        );
        postLabJobOrder(labJobData[0])
          .then(() => {
            removeAll(
              userData.id,
              "LabJobOrder",
              Messages.displayLabJobMessage(cartData.length)
            );
            setSubmitOrderLoading(true);
          })
          .catch((err) => {
            toast.error(err);
            setSubmitOrderLoading(true);
          });
      });
    });
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
                  height="auto"
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
            right: `120px`,
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