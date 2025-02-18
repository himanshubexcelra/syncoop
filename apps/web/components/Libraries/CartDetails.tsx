/*eslint max-len: ["error", { "code": 100 }]*/
import { useEffect, useMemo, useRef, useState } from "react";
import CustomDataGrid from "@/ui/dataGrid";
import ConfirmationDialog from "./ConfirmationDialog";
import { Button as Btn } from "devextreme-react/button";
import Image from "next/image";
import { useRouter } from 'next/navigation';
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
  ReactionLabJobOrder,
  AssayFieldList,
  AssaySaved
} from "@/lib/definition";
import {
  submitOrder,
  postLabJobOrder,
  updateLabJobApi,
  getSynthesisMoleculesData
} from "./service";
import dynamic from "next/dynamic";
import {
  filterCartDataForAnalysis,
  filterCartDataForLabJob,
  generateRandomDigitNumber,
  mapCartData,
  delay
} from "@/utils/helpers";
import toast from "react-hot-toast";
import { Messages } from "@/utils/message";
import { DELAY, LabJobStatus, ReactionStatus } from "@/utils/constants";
import MoleculeStructureActions from "@/ui/MoleculeStructureActions";
import Accordion, { Item } from 'devextreme-react/accordion';
import { Switch } from "devextreme-react";
import Link from "next/link";

interface CartDetailsProps {
  cartData: CartItem[];
  userData: UserData;
  containsProjects: boolean;
  removeItemFromCart: (item: DeleteMoleculeCart) => void;
  removeAll: (user_id: number, type: string, msg: string) => void;
  close: () => void;
  loader: boolean;
}
export default function CartDetails({
  cartData,
  userData,
  containsProjects,
  removeItemFromCart,
  removeAll,
  close,
  loader
}: CartDetailsProps) {
  const router = useRouter();
  const [isDisable, setDisableButton] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
  const [cellData, setCellData] = useState<CellData>({
    smiles_string: "",
    source_molecule_name: ''
  });
  const [isSubmitOrderLoading, setSubmitOrderLoading] = useState(false);
  const [showAccordion, setShowAccordion] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const [analysisState, setAnalysisState] = useState<CartDetail[]>([]);
  const [labJobState, setLabJobState] = useState<CartDetail[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);

  useEffect(() => {
    const analysisData = filterCartDataForAnalysis(cartData);
    const labJobData = filterCartDataForLabJob(cartData);

    setAnalysisState(mapCartData(analysisData, userData.id));
    setLabJobState(mapCartData(labJobData, userData.id));

  }, [cartData]);


  const closeMagnifyPopup = (event: any) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setPopupVisible(false);
    }
  };
  const MoleculeStructure = dynamic(() => import("@/utils/MoleculeStructure"), {
    ssr: false,
  });

  const handleStructureZoom = (event: any, data: any) => {
    const { x, y } = event.event.target.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    setPopupCords({ x, y: y >= screenHeight / 2 ? y - 125 : y });
    setPopupVisible(true);
    setCellData({ ...data, source_molecule_name: data.moleculeName });
  }

  const setExpandValue = (e: any) => {
    if (e.columnIndex === 4) {
      if (e.data?.id && !expanded.includes(e.data.id)) {
        setExpanded((prev) => [...prev, e.data.id]);
      }
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
      dataField: 'assays',
      title: 'Bio Assay',
      width: 120,
      alignment: 'center',
      allowHeaderFiltering: false,
      allowSorting: false,
      customRender: (data) => {
        if (!expanded.includes(data.id)) {
          const length = data.assays?.length;
          const value = data.assays?.map((val: AssayFieldList, idx: number) => {
            const name = val.name || Object.keys(val)[0];
            if (idx >= 3) return;
            if (length - 1 !== idx && idx < 2)
              return <span key={`${name}-1`}>
                {name} ,
              </span>
            if (length - 1 === idx && idx < 2)
              return <span key={`${name}-2`}>
                {name}
              </span>
            return <span key={`${name}-3`} className="text-themeBlueColor">
              + {length - idx}
            </span>
          });
          return <div className="cursor-pointer line-clip">
            {value}
          </div>
        } else {
          return <span className="no-clip">
            {data.assays?.[0].name ?
              data.assays.map((val: AssayFieldList) => val.name).join(', ')
              :
              data.assays.map((item: AssaySaved) => Object.keys(item)[0]).join(', ')
            }
          </span>
        }
        // return data.assays;
      }
    },
    {
      title: "Actions",
      width: 24,
      allowHeaderFiltering: false,
      allowSorting: false,
      customRender: (data) => (
        <>
          <Btn
            render={() => (
              <Image
                src="/icons/edit.svg"
                width={24}
                height={24}
                alt="Edit"
              />
            )}
            onClick={() => {
              router.push(
                `/projects/${data.project_id}?library_id=${data.library_id}&assays=true`
              )
              close();
            }}
          />
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
        </>
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
    const ordered_molecules_data = cartData.map((item) =>
      ({ id: item.molecule_id, assays: item.assays || [] }));
    const order_id = generateRandomDigitNumber();

    const orderDetails: OrderType = {
      order_id: order_id,
      order_name: `Order${order_id}`,
      ordered_molecules: ordered_molecules,
      ordered_molecules_data,
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
            "Synthetic template": reaction_detail.reaction_name,
            "Temperature setting": reaction_detail.temperature,
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

  const prepareLabJobData = (res: any): SaveLabJobOrder[] => {
    const hasPathways = res?.pathway?.length > 0;
    const pathway = hasPathways ? res.pathway[0] : null;
    const totalReactions = pathway?.reaction_detail?.length || 0;
    const finalProduct = pathway?.reaction_detail?.[totalReactions - 1] || null;

    return [
      {
        molecule_id: res.id,
        pathway_id: pathway?.id || null,
        product_smiles_string: hasPathways
          ? finalProduct?.product_smiles_string || null
          : res?.smiles_string || null,
        product_molecular_weight: hasPathways
          ? finalProduct?.product_molecular_weight || null
          : res?.molecular_weight || null,
        no_of_steps: hasPathways ? pathway?.step_count || null : null,
        functional_bioassays: res.assays,
        reactions: hasPathways ? prePareReactions(pathway) : [],
        created_by: userData.id,
        status: LabJobStatus.Submitted,
        reactionStatus: ReactionStatus.InProgress,
      },
    ];
  };

  const processLabJobOrders = async (labJobOrderData: SaveLabJobOrder[]) => {
    try {
      let labJobStateCount = 0;
      let analysisStateCount = 0;
      let successMessage = '';
      let isSuccess = false;
      for (const item of labJobOrderData) {
        try {
          // Post the lab job order
          const result = await postLabJobOrder(item);
          if (!result || !result.lab_job_order_id) {
            console.error("Invalid result from postLabJobOrder:", result);
            // Skip this iteration if we don't get a valid result.
            continue;
          }
          // Update the lab job order by API call
          const response = await updateLabJobApi(result.lab_job_order_id);
          if (!response.error) {
            successMessage = response?.message;
            isSuccess = true;
            // Update counts after successful processing
            labJobStateCount = labJobState?.length || 0;
            analysisStateCount = analysisState?.length || 0;
          } else {
            // Handle error returned from update API
            const errorMessage = response.error.detail;
            const toastId = toast.error(errorMessage);
            await delay(DELAY);
            toast.remove(toastId);
          }
        } catch (error) {
          // Catch any unexpected errors per order
          const errorMessage = Messages.PROCESSING_LABJOB_ERROR;
          console.error(errorMessage, error);
          const toastId = toast.error(errorMessage);
          await delay(DELAY);
          toast.remove(toastId);
        }
      }
      if (isSuccess) {
        const toastId = toast.success(successMessage);
        await delay(DELAY);
        toast.remove(toastId);
        // After processing all orders, show a summary message and remove all orders
        const summaryMessage = Messages.displayLabJobMessage(labJobStateCount, analysisStateCount);
        removeAll(userData.id, "LabJobOrder", summaryMessage);
      }
      // Turn off the submit/loading state
      setSubmitOrderLoading(false);
    } catch (error) {
      console.error("Unexpected error in processLabJobOrders:", error);
      setSubmitOrderLoading(false);
    }
  }

  const handleLabJobOrder = async () => {
    setSubmitOrderLoading(true);
    let labJobDataList: SaveLabJobOrder[] = [];
    const molecule_ids = cartData.map((data) => data.molecule_id);
    const moleculesSynthesisData = await getSynthesisMoleculesData(molecule_ids);
    if (moleculesSynthesisData.length) {
      moleculesSynthesisData.map((data: any) => {
        labJobDataList = [
          ...labJobDataList,
          ...prepareLabJobData(data)
        ];
      });
    }
    processLabJobOrders(labJobDataList);
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

  const handleToggleChange = () => {
    setShowAccordion(!showAccordion);
  };

  const data = useMemo(() => mapCartData(cartData, userData.id), [cartData, userData.id]);

  return (
    <>
      {
        loader ? <div style={{ marginTop: '300px', marginLeft: '305px' }}><LoadIndicator /></div>
          : cartData.length > 0 ? (
            <div>
              <div className="popup-content">
                <div className="popup-grid max-h-[550px]"
                  onClick={closeMagnifyPopup}>
                  {containsProjects ? (
                    <div>
                      <CustomDataGrid
                        columns={columns}
                        maxHeight="550px"
                        data={data}
                        onCellClick={setExpandValue}
                        groupingColumn={rowGroupName()}
                        enableGrouping
                        enableSorting={false}
                        enableFiltering={false}
                        enableOptions={false}
                        enableRowSelection={false}
                        enableSearchOption={false}
                        loader={false}
                      />
                    </div>
                  ) : (
                    <div>
                      {/* Analysis Section */}
                      {analysisState?.length > 0 &&
                        <Accordion collapsible multiple={true}>
                          <Item titleRender={() => "Molecules for Analysis"}>
                            <div>
                              <div className="flex flex-row items-center justify-end">
                                <label className="mr-3 font-lato font-bold 
                                  text-[12.69px] text-greyText">Show Products
                                </label>
                                <Switch value={showAccordion} onValueChanged={handleToggleChange} />
                              </div>
                              <CustomDataGrid
                                columns={columns}
                                maxHeight="550px"
                                data={analysisState}
                                groupingColumn={rowGroupName()}
                                onCellClick={setExpandValue}
                                enableGrouping
                                enableSorting={false}
                                enableFiltering={false}
                                enableOptions={false}
                                enableRowSelection={false}
                                enableSearchOption={false}
                                loader={false}
                              />
                            </div>
                          </Item>
                        </Accordion>}

                      {/* Lab Job Section */}
                      {labJobState?.length > 0 &&
                        <Accordion collapsible multiple={true}>
                          <Item titleRender={() => "Synthesis Lab Job"}>
                            <div>
                              <div className="flex flex-row items-center justify-end">
                                <label className="mr-3 font-lato font-bold 
                                  text-[12.69px] text-greyText">Show Products
                                </label>
                                <Switch value={showAccordion} onValueChanged={handleToggleChange} />
                              </div>
                              <CustomDataGrid
                                columns={columns}
                                maxHeight="550px"
                                data={labJobState}
                                onCellClick={setExpandValue}
                                groupingColumn={rowGroupName()}
                                enableGrouping
                                enableSorting={false}
                                enableFiltering={false}
                                enableOptions={false}
                                enableRowSelection={false}
                                enableSearchOption={false}
                                loader={false}
                                paging={false}
                              />
                            </div>
                          </Item>
                        </Accordion>}
                    </div>
                  )
                  }
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
            </div>
          ) : (
            <>No Items in the cart</>
          )}
      {confirm && (
        <ConfirmationDialog
          onSave={handleLabJobOrder}
          openConfirmation={confirm}
          setConfirm={(e: any) => handleCancel(e)}
          msg={Messages.displayLabJobMessage(labJobState?.length, analysisState?.length)}
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