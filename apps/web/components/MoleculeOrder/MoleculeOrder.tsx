/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import CustomDataGrid from '@/ui/dataGrid';
import {
  BreadCrumbsObj,
  MoleculeOrder,
  MoleculeOrderParams,
  MoleculeStatusCode,
  OrganizationType,
  TabDetail,
  UserData,
  ReactionInputData,
  NodeType,
  Compound,
  ReactionCompoundType,
  PathwayType,
  ReactionDetail,
  CreateLabJobOrder,
  SelectedPathwayInstance,
  CellData,
  ColumnConfig,
  Status,
  MoleculeStatusLabel,
  ReactionButtonNames,
  ResetState,
  FormState,
  AmsInventoryItem,
  GeneratePathwayType,
} from '@/lib/definition';
import Image from 'next/image';
import {
  COLOR_SCHEME,
  moleculeStatus,
  PATHWAY_BOX_WIDTH,
  ReactionColors,
  ReactionColorsType,
  ReactionStatus,
  sample_molecule_ids
} from '@/utils/constants';
import { Button, CheckBox, LoadIndicator, Popup, } from 'devextreme-react';
import {
  EditorPreparingEvent,
  RowClickEvent
} from 'devextreme/ui/data_grid';
import {
  getMoleculesOrder, saveReactionPathway,
  getReactionPathway, updateReaction,
  searchInventory,
} from '@/components/MoleculeOrder/service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import SendMoleculesForSynthesis from '../Libraries/SendMoleculesForSynthesis';
import {
  createAssayColumns,
  extractJsonData,
  getADMECalculation,
  getADMEColor,
  getAverage,
  getStatusObject,
  groupOrders,
  isAdmin,
  isCustomReactionCheck,
  isLibraryManger,
  isProtocolAproover,
  isResearcher,
  isResearcherAndProtocolAproover,
  isSystemAdmin,
  popupPositionValue,
  randomValue,
  setPath,
} from '@/utils/helpers';
import './MoleculeOrder.css';
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import CustomTooltip from '@/ui/CustomTooltip';
import MoleculeStructureActions from '@/ui/MoleculeStructureActions';
import {
  addMoleculeToCart,
  generatePathway,
  updateMoleculeStatus,
} from '@/components/Libraries/service'
import PathwayImage from '../PathwayImage/PathwayImage';
import PathwayAction from "@/components/PathwayImage/PathwayAction";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import ReactionDetails from './ReactionDetails';
import Tabs from '@/ui/Tab/Tabs';
import ConfirmationDialog from './ConfirmationDialog';
import { COMPOUND_TYPE_R, DELAY } from "@/utils/constants";
import { delay } from "@/utils/helpers";
import StatusCard from '@/ui/StatusCard';
// import { basename } from 'path';
import dynamic from 'next/dynamic';
import AdmeInfo from '../Tooltips/AdmeInfo';

export type EditorPreparingEventEx<TRowData = any, TKey = any> =
  EditorPreparingEvent<TRowData, TKey> & {
    command?: string;
    type?: string;
  }

interface Reaction {
  reaction_id: number;
  reaction_template: string;
  reaction_compound: Compound[];
  reaction_detail: []
  id: number;
  temperature: number;
  solvent: string;
}

type PathObjectType = {
  pathIndex: number[]; // pathIndex is an array of numbers
}

type MoleculeOrderPageTypeProps = {
  userData: UserData,
  actionsEnabled: string[],
  customerOrgId?: number
}

const isClickable = [MoleculeStatusLabel.Ordered, MoleculeStatusLabel.InRetroQueue];

const MoleculeStructure = dynamic(() => import("@/utils/MoleculeStructure"), {
  ssr: false,
});

export default function MoleculeOrderPage({
  userData,
  actionsEnabled,
  customerOrgId
}: MoleculeOrderPageTypeProps) {
  const { organization_id, orgUser, myRoles } = userData;
  const { type } = orgUser;
  const [loader, setLoader] = useState(false);
  const [moleculeOrderData, setMoleculeOrderData] = useState<MoleculeOrder[]>([]);
  const [synthesisView, setSynthesisView] = useState<boolean>(false);
  const [pathwayView, setPathwayView] = useState(false);
  const [nodeValue, setNodes] = useState<NodeType[][]>([]);
  const [synthesisPopupPos, setSynthesisPopupPosition] = useState<any>({});
  const [isSendForSynthesisEnabled, setSendForSynthesisEnabled] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs
  const [selectedPathwayIndex, setSelectedPathway] = useState(-1);
  const [moleculeData, setMoleculeData] = useState<MoleculeOrder[]>([]);
  const [inRetroData, setToIntroQueue] = useState<MoleculeOrder[]>([]);
  const [updatedAt, setUpdatedAt] = useState(Date.now());
  const [pathwayDataLocal, setPathwayData] = useState<NodeType[]>([]);
  const [popupWidth, setPopupWidth] = useState(PATHWAY_BOX_WIDTH);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const context: any = useContext(AppContext);
  const appContext = context.state;
  const [reactionsData, setReactionsData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [nextReaction, setNextReaction] = useState<boolean>(false);
  const [selectedRow, setSelectRow] = useState(-1);
  const [moleculeCompound, setMoleculeCompound] = useState<any[]>([]);
  const [reactionDetail, setReactionDetail] = useState<ReactionDetail>();
  const [confirm, setConfirm] = useState(false);
  const [reactionIndexList, setReactionIndexList] = useState<PathObjectType[]>([]);
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<number>();
  const [selecteLabJobOrder, setSelecteLabJobOrder] = useState<CreateLabJobOrder[]>([]);
  const [selectedMoleculeOrder, setSelectedMoleculeOrder] = useState<MoleculeOrder[]>([]);
  const [pathwayReaction, setPathWayReaction] = useState([])
  const [isEditpathWay, setEditPathway] = useState(true)
  const [buttonClicked, setButtonClicked] = useState(false);
  const permitSumbitSynthesis = actionsEnabled.includes('generate_pathway');
  const permitEditReaction = actionsEnabled.includes("edit_reactions");
  const permitSubmitLabJob = actionsEnabled.includes('create_modify_submit_synthesis_lab_job');
  const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
  const [popupVisible, setPopupVisible] = useState(false);
  const [updatedKey, setUpdatedKey] = useState('');
  const [cellData, setCellData] = useState<CellData>({
    smiles_string: "",
    source_molecule_name: ''
  });
  const popupRef = useRef<HTMLDivElement>(null);
  const [resetReaction, setResetReaction] = useState<number>(ResetState.RESET);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButtonIndex, setLoadingButtonIndex] = useState<number | null>();
  const [isLabJobLoading, setIsLabJobLoading] = useState(false);
  const [submittedTabs, setSubmittedTabs] = useState<boolean[]>([]);
  const [formStates, setFormStates] = useState<boolean[]>([]);
  const [pathwayID, setPathwayID] = useState<number>(0);
  const [viewImage, setViewImage] = useState(false);
  const [selectionEnabledRows, setSelectionEnabledRows] = useState<object[]>([]);
  const [popUpType, setPopUpType] = useState<number>(0);
  const [reactantList, setReactantList] = useState<ReactionCompoundType[]>([]);
  const [reactionOnlyView, setReactionOnlyView] = useState<boolean>(false);
  const [pathwayWidth, setPathwayWidth] = useState<number>(0);
  const permitSubmitAnalysis = ['admin', 'protocol_approver', 'researcher'].some(role =>
    myRoles?.includes(role));
  const [disableAnalysis, setDisableAnalysis] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const [clickedMolecule, setClickedMolecule] = useState(-1);
  const [isCustomReaction, setCustomReaction] = useState(false);
  const [pathwayKeys, setPathwayKeys] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem('pathway_box_width');
      const width = storedValue ? Number(storedValue) : PATHWAY_BOX_WIDTH;
      setPopupWidth(width);
    }
  }, []);


  useEffect(() => {
    fetchMoleculeOrders();
  }, [appContext?.refreshCart]);

  const closeMagnifyPopup = (event: any) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setPopupVisible(false);
      setButtonClicked(false);
      setDisableAnalysis(false);
    }
  };
  const permitValidatePathway = actionsEnabled.includes('validate_pathway');

  /* const selectionRef = useRef<{
    checkBoxUpdating: boolean,
    selectAllCheckBox: dxCheckBox | null
  }>({
    checkBoxUpdating: false,
    selectAllCheckBox: null
  }); */

  const breadcrumbs: BreadCrumbsObj[] = [
    { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
    {
      label: 'Molecule Orders', svgPath: '/icons/molecule-order.svg',
      svgWidth: 16, svgHeight: 16, href: '/projects', isActive: true
    },
  ];

  const clickableRow = (data: MoleculeOrder) => {
    const { molecule_status: moleculeStatus } = data;
    let isClickableRow = !isClickable.includes(moleculeStatus);
    const labJobOrderStatus = moleculeStatus === MoleculeStatusLabel.InProgress ||
      moleculeStatus === MoleculeStatusLabel.Failed ||
      moleculeStatus === MoleculeStatusLabel.Done;
    const isAnalysis = !data.pathway_id && labJobOrderStatus;
    if (isSystemAdmin(myRoles) || isResearcherAndProtocolAproover(myRoles)) {
      isClickableRow = (
        moleculeStatus === MoleculeStatusLabel.Ready ||
        moleculeStatus === MoleculeStatusLabel.InReview ||
        moleculeStatus === MoleculeStatusLabel.Validated ||
        labJobOrderStatus)
    } else if (isResearcher(myRoles)) {
      // Researchers can click only if status is 'Ready'
      isClickableRow = (
        moleculeStatus === MoleculeStatusLabel.Ready || labJobOrderStatus
      )
    } else if (isProtocolAproover(myRoles)) {
      // Protocol approvers can click only if status is 'InReview' and 'Validated'
      isClickableRow = (
        moleculeStatus === MoleculeStatusLabel.InReview ||
        moleculeStatus === MoleculeStatusLabel.Validated || labJobOrderStatus
      )
    }

    return isClickableRow && !isAnalysis;
  };

  const columns: ColumnConfig[] = [
    {
      dataField: 'type',
      title: 'Type',
      width: 100,
      alignment: 'left',
      allowSorting: false,
      customRender: (data) => {
        const isCustomReaction = isCustomReactionCheck(data.projectMetadata);
        if (isCustomReaction) {
          return (
            <Image
              src="/icons/custom-reaction-md.svg"
              width={18}
              height={18}
              alt="Custom Reaction"
            />
          );
        }
        else {
          return (
            <Image
              src="/icons/retrosynthesis-md.svg"
              width={18}
              height={18}
              alt="Retrosynthesis"
            />
          )
        }
      }
    },
    {
      dataField: 'smiles_string',
      title: 'Structure',
      minWidth: 200,
      width: 200,
      alignment: 'center',
      allowHeaderFiltering: false,
      allowSorting: false,
      customRender: (data) => (
        <MoleculeStructureActions
          smilesString={data.smiles_string}
          molecule_id={data.molecule_id}
          structureName={data.source_molecule_name}
          onZoomClick={(e: any) => {
            e.event.stopPropagation();
            setButtonClicked(true);
            handleStructureZoom(e, data);
          }}
        />
      ),
    },
    /* 
    Commented out but it's needed in beta phase
    {
      dataField: 'order_status', title: 'Order Status',
      allowHeaderFiltering: true,
      allowSorting: true,
      width: 160,
      cssClass: 'moleculeOrderStatus',
      customRender: (data: MoleculeOrder) => {
        const status: Status[] = getStatusObject(moleculeOrderStatus, data.order_status);
        if (status.length) {
          return (
            <StatusCard id={data.id} stat={status[0]} />
          );
        }
      }
    }, */
    {
      dataField: 'molecule_id',
      title: 'Molecule ID',
      allowHeaderFiltering: true,
      allowSorting: true,
      width: 150,
      alignment: 'center',
      defaultSortOrder: "desc",
      dataType: 'numeric',
      customRender: (data) => {
        /* const pathwaysCheck = ((data?.pathway_id !== null &&
          (data?.molecule_status === MoleculeStatusLabel.InProgress ||
            data?.molecule_status === MoleculeStatusLabel.Done ||
            data?.molecule_status === MoleculeStatusLabel.Failed)) ||
          (data?.molecule_status === MoleculeStatusLabel.Ready ||
            data?.molecule_status === MoleculeStatusLabel.Validated))
          ? true : false; */
        const isClickable = clickableRow(data) || isCustomReactionCheck(data.projectMetadata);
        return (isClickable) ? (
          <button
            className="text-themeBlueColor underline"
          >
            {data.molecule_id}
          </button>
        ) : (
          <p>{data.molecule_id}</p>
        );
      }
    },
    {
      dataField: 'molecular_weight',
      title: 'Molecular Weight',
      width: 100,
      allowHeaderFiltering: false,
      allowSorting: true,
      alignment: 'center',
      cssClass: 'moleculeStatus',
      dataType: 'numeric',
      customRender: (data) => {
        if (data.molecular_weight) {
          const key = 'molecular_weight';
          const formulaeFound = COLOR_SCHEME[key].formulaes.find((formulae: {
            min: number,
            max: number,
            formulae: (value: string) => void
          }) =>
            data.molecular_weight >= formulae.min && data.molecular_weight < formulae.max
          );
          const { formulae } = formulaeFound;
          const calculatedResult = formulae(data.molecular_weight);
          const colorFound = COLOR_SCHEME[key].color.find((color: any) => {
            return calculatedResult >= color.min && calculatedResult < color.max
          });
          return (
            <span className={`${colorFound?.className} status-mark`}>
              {Number(data.molecular_weight).toFixed(2)}
            </span>
          );
        }
        return '';
      }
    },
    {
      dataField: 'molecule_status',
      title: 'Molecule Status',
      width: 160,
      allowHeaderFiltering: true,
      allowSorting: true,
      alignment: 'center',
      cssClass: 'moleculeStatus',
      customRender: (data: MoleculeOrder) => {
        const status: Status[] = getStatusObject(moleculeStatus, data.molecule_status);
        if (status.length) {
          return (
            <StatusCard id={Number(data.id)} stat={status[0]} />
          );
        }
      }
    },
    {
      dataField: 'yield',
      title: 'Yield(%)',
      width: 100,
      alignment: "center",
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.reaction_data) {
          const key = 'yield';
          const { rxn_product_yield } = data.reaction_data;
          const yieldValue = rxn_product_yield.split('%')[0];
          const formulaeFound = COLOR_SCHEME[key].formulaes.find((formulae: {
            min: number,
            max: number,
            formulae: (value: string) => void
          }) =>
            yieldValue >= formulae.min &&
            yieldValue < formulae.max
          );
          const { formulae } = formulaeFound;
          const calculatedResult = formulae(yieldValue);
          const reference = COLOR_SCHEME[key].reference
          const colorFound = COLOR_SCHEME[key].color.find((color: any) => {
            return calculatedResult >= color.min && calculatedResult < color.max
          });
          const id = `${key}-${data.molecule_id}`
          return (
            <div className={`${colorFound?.className} status-mark`}>
              <span id={id}>{rxn_product_yield}</span>
              <CustomTooltip
                id={id}
              >
                <AdmeInfo
                  rawValues={[rxn_product_yield]}
                  status={colorFound.status}
                  reference={reference} />
              </CustomTooltip>
            </div>
          );
        }

      }
    },
    {
      dataField: 'analyse',
      title: 'Analyse',
      width: 80,
      allowHeaderFiltering: false,
      allowSorting: false,
      customRender: (data) => {
        if (data.reaction_data) {
          /* const imgPath = basename(data.reaction_data.rxn_product_nmr);
          const pdfPath = basename(data.reaction_data.rxn_product_lcms); */
          const imgPath = '1001_nmr_image_3.png';
          const pdfPath = '1001_lcms_report_3.pdf';
          return (
            <div className={`flex flex-col items-center
            justify-center text-themeBlueColor`}>
              <div className="flex items-center">
                <span
                  className="font-lato text-sm font-normal mr-2 cursor-pointer"
                  onClick={() => {
                    setSelectedMoleculeOrder([data]);
                    setViewImage(true)
                  }}>NMR</span>
                <a href={`/images/${imgPath}`}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <Image
                    src={"/icons/download.svg"}
                    alt="link tab"
                    width={24}
                    height={24}
                  />
                </a>
              </div>
              <div className="flex items-center">
                <a href={`/data/${pdfPath}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  <span className="font-lato text-sm font-normal mr-2">MS</span>
                </a>
                <a href={`/data/${pdfPath}`}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="flex items-center">
                  <Image
                    src={"/icons/download.svg"}
                    alt="link tab"
                    width={24}
                    height={24}
                  />
                </a>
              </div>
            </div>)
        }
        return '';
      }
    },
    {
      dataField: 'Caco2_Papp',
      title: 'Caco-2(cm/sec)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'Caco2_Papp';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toExponential(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'CLint_Human',
      title: 'CLint Human(μL/min/mg)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'CLint_Human';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return ''
        }
        return '';
      }
    },
    {
      dataField: 'CLint_Rat',
      title: 'CLint Rat(μL/min/mg)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'CLint_Rat';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'CLint_Mouse',
      title: 'CLint Mouse(μL/min/mg)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'CLint_Mouse';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'Fub_Human',
      title: 'Fub Human(%)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'Fub_Human';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'Fub_Rat',
      title: 'Fub Rat(%)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'Fub_Rat';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'Fub_Mouse',
      title: 'Fub Mouse(%)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'Fub_Mouse';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'HepG2_IC50',
      title: 'HepG2 IC50(μM)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'HepG2_IC50';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'hERG_Ki',
      title: 'hERG Ki(μM)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'hERG_Ki';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    },
    {
      dataField: 'solubility',
      title: 'Solubility(μM)',
      width: 80,
      cssClass: 'moleculeStatus',
      allowHeaderFiltering: false,
      allowSorting: true,
      dataType: 'numeric',
      customRender: (data) => {
        if (data.adme_data) {
          const key = 'Solubility';
          const result = getAverage(data.adme_data, key);
          if (result) {
            const { average, value1, value2 } = result;
            const calculatedResult = getADMECalculation(average, key);
            const reference = COLOR_SCHEME[key].reference;
            const colorFound = getADMEColor(calculatedResult, key);
            const id = `${key}-${data.molecule_id}`
            return (
              <div className={`${colorFound?.className} status-mark`}>
                <span id={id}>{average.toFixed(2)}</span>
                <CustomTooltip
                  id={id}
                >
                  <AdmeInfo
                    rawValues={[value1, value2]}
                    status={colorFound.status}
                    reference={reference} />
                </CustomTooltip>
              </div>
            );
          }
          return '';
        }
        return '';
      }
    }
  ];

  // useEffect(() => {
  //   console.log('test12345');

  //   const socket = new WebSocket(
  //     'wss://ia5cg5jeeb.execute-api.us-east-1.amazonaws.com/Dev/');

  //   socket.onopen = () => {
  //     console.log("WebSocket connection established");
  //   };

  //   socket.onmessage = (event) => {
  //     console.log("Message received: ", event.data);
  //   };

  //   socket.onclose = () => {
  //     console.log("WebSocket connection closed");
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  useEffect(() => {
    if (pathwayKeys.length === 0) return;

    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    }
    const queryParams = new URLSearchParams(headers).toString();
    // const socket = new WebSocket(
    //   `${process.env.NEXT_PUBLIC_WEB_SOCKET_URL}/?${queryParams}`);

    // New Socket URL  
    // const socket = new WebSocket(
    //   `wss://ia5cg5jeeb.execute-api.us-east-1.amazonaws.com/Dev/?${queryParams}`); 
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEB_SOCKET_URL}/?${queryParams}`);
    socket.onopen = () => {
      console.log('Onopen socket');

      pathwayKeys.forEach(key => {
        socket.send(JSON.stringify({ key })); // Send each key one at a time
      });
    };

    socket.onmessage = async (event) => {
      console.log('onmessage socket');

      if (event.data && typeof event.data === "string") {
        const parsedData = JSON.parse(event.data);
        console.log(parsedData, "parsedDataparsedData");

        const message = parsedData.message;
        if (typeof message === "string" && message !== "Forbidden") {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.status == true) {
            setSelectedRows([]);
            await updateMoleculeStatus(moleculeData, MoleculeStatusCode.Ready, userData.id);
            setMoleculeStatus(moleculeData, MoleculeStatusLabel.Ready);
            // extractJsonData(PathwayData, moleculeData);
            setMoleculeData([]);
          } else {
            setSelectedRows([]);
            setMoleculeStatus(moleculeData, MoleculeStatusLabel.Failed);
            await updateMoleculeStatus
              (moleculeData, MoleculeStatusCode.Failed, userData.id);
          }
        }
        // since we use mock data this will be needed later

        //   const foundMolecule = moleculeData.find((molecule: MoleculeOrder) =>
        //     molecule.molecule_id === parsedMessage.molecule_id);
        //   if (foundMolecule && parsedMessage.status == true) {
        //     await updateMoleculeStatus(moleculeData, MoleculeStatusCode.Ready, userData.id);
        //     setMoleculeStatus(moleculeData, MoleculeStatusLabel.Ready);
        //     const currentSelectedRows = selectedRows.filter(key =>
        //       parsedMessage.molecule_id == key);
        //     setSelectedRows(currentSelectedRows);
        //     // extractJsonData(PathwayData, [foundMolecule]);
        //     setMoleculeData(moleculeData.filter(molecule =>
        //       foundMolecule.molecule_id == molecule.molecule_id));
        //   } else if (moleculeData.includes(parsedMessage.molecule_id) &&
        //     parsedMessage.status == false) {
        //     setMoleculeStatus(moleculeData, MoleculeStatusLabel.Failed);
        //     await updateMoleculeStatus
        // (moleculeData, MoleculeStatusCode.Failed, userData.id);
        //   }
        // }
      }
    };

    socket.onerror = (error) => {
      console.log("WebSocket error", error);
    };

    return () => {
      socket.close();
    };
  }, [pathwayKeys]);

  const [orderColumns, setMoleculeOrderColumns] = useState(columns);

  /* const selectionRef = useRef<{
    checkBoxUpdating: boolean,
    selectAllCheckBox: dxCheckBox | null
  }>({
    checkBoxUpdating: false,
    selectAllCheckBox: null
  }); */

  const rowGroupName = () => {
    if (type === OrganizationType.External || customerOrgId) {
      if (isAdmin(myRoles) || isResearcher(myRoles) || isProtocolAproover(myRoles)) {
        return "organization / Order";
      }
      return "project / library";
    } else if (type === OrganizationType.Internal) {
      return "organization / Order";
    }
  }

  const prepareLabOrderData = (data: MoleculeOrder) => {
    const { molecule_id, molecule_order_id, library_id, project_id,
      organization_id, assays } = data || {};
    const selectedMolecule: CreateLabJobOrder[] = [{
      molecule_id: molecule_id,
      order_id: Number(molecule_order_id),
      library_id: library_id,
      project_id: project_id,
      organization_id: organization_id,
      user_id: userData.id,
      assays,
    }];
    setSelecteLabJobOrder(selectedMolecule)
  }

  const setLocalPath = (data: MoleculeOrder) => {
    prepareLabOrderData(data)
    setPath({
      rowData: data,
      setSelectedMoleculeId,
      myRoles: userData.myRoles,
      setReactionIndexList,
      setPathwayView,
      setNodes
    });
  }

  const updateMoleculeDataStatus = async (statusCode: number, statusLabel: any) => {
    const moleculeData: any = [moleculeOrderData.find((item: any) =>
      item.molecule_id === selectedMoleculeId)]
    await updateMoleculeStatus(moleculeData, statusCode, userData.id);
    setMoleculeStatus(moleculeData, statusLabel);
  }

  const createLabJobOrder = () => {
    setIsLabJobLoading(true);
    const labjobOrder: CreateLabJobOrder[] = selecteLabJobOrder;
    context?.addToState({
      ...appContext,
      cartDetail: [...labjobOrder]
    });
    addMoleculeToCart(labjobOrder, MoleculeStatusCode.ValidatedInCart)
      .then((res) => {
        if (res) {
          setPathwayView(false);
          setSelectedPathway(-1);
          updateMoleculeDataStatus(MoleculeStatusCode.ValidatedInCart,
            MoleculeStatusLabel.ValidatedInCart);
          toast.success(Messages.CREATE_LAB_JOB_ORDER, {
            position: 'top-center'
          });
          setIsLabJobLoading(false);
        }
      })
      .catch((error) => {
        toast.error(error, {
          position: 'top-center'
        });
        setIsLabJobLoading(false);
      })
  }

  const fetchMoleculeOrders = async () => {
    let data = [];
    let transformedData: any[] = [];
    setLoader(true);
    try {
      if (type === OrganizationType.External || customerOrgId) {
        // External users: fetch records filtered by organization_id
        let params: MoleculeOrderParams = {
          organization_id: customerOrgId || organization_id,
          sample_molecule_id: Number(randomValue(sample_molecule_ids))
        };
        if (isLibraryManger(myRoles)) {
          params = {
            ...params,
            created_by: userData.id
          }
        }
        data = await getMoleculesOrder(params);
      } else if (type === OrganizationType.Internal) {
        // Internal users: fetch all records without filters
        data = await getMoleculesOrder({
          sample_molecule_id: Number(randomValue(sample_molecule_ids))
        });
      } else {
        toast.error(Messages.USER_ROLE_CHECK);
      }
      if (!data.error) {
        const selectionEnabledRows = data.filter(
          (row: MoleculeOrder) => !row.disabled);
        setSelectionEnabledRows(selectionEnabledRows);
        /* if (isSystemAdmin(myRoles) || isProtocolAproover(myRoles)) {
          const params = {
            user_id: Number(userData.id),
            lab_job_cart: true
          }
          const cartDataAvaialable: any = await getMoleculeCart(params);
          const moleculeIds = cartDataAvaialable.map((item: any) => item.molecule_id);
          const selectedMoleculeInCart = data
            .filter((item: any) => moleculeIds.includes(item.molecule_id))
            .map((item: any) => item.id);
          setCartMolecule(selectedMoleculeInCart);
        } */
        // Transform the fetched data if data is available
        transformedData = data?.map((item: any) => {
          const {
            order_name,
            organizationName,
            molecular_weight,
            smiles_string,
            projectname,
            libraryname,
            status,
            organizationMetadata,
            ...rest
          } = item;
          return {
            ...rest,
            organizationName,
            molecular_weight,
            smiles_string,
            status,
            order_name,
            organizationMetadata,
            ...(() => {
              if (type === OrganizationType.External || customerOrgId) {
                if (isAdmin(myRoles) || isResearcher(myRoles) || isProtocolAproover(myRoles)) {
                  return {
                    "organization / Order":
                      `${organizationName} / ${order_name}`
                  }
                }
                return {
                  "project / library": `${projectname} / ${libraryname}`
                }
              } else if (type === OrganizationType.Internal) {
                return {
                  "organization / Order":
                    `${organizationName} / ${order_name}`
                }
              }
            })()
          };
        });

        setMoleculeOrderData(transformedData);
        const columnConfigs = createAssayColumns(transformedData);
        const newColumns = [...columns, ...columnConfigs];
        setMoleculeOrderColumns(newColumns);
      } else {
        const toastId = toast.error(`${data.error}`);
        await delay(DELAY);
        toast.remove(toastId);
      }
    } catch (error) {
      console.error(Messages.FETCH_ERROR, error);
      transformedData = []; // Set to an empty array in case of an error
      setMoleculeOrderData([]);
    } finally {
      setLoader(false);
    }
  }
  const handleStructureZoom = (event: any, data: any) => {
    const isCustomReaction = isCustomReactionCheck(data.projectMetadata);
    if (isCustomReaction) {
      setCustomReaction(true);
      setPath({ rowData: data, myRoles: userData.myRoles, setNodes });
      setClickedMolecule(data.molecule_id);
      if (!data.disabled) {
        setSelectRow(event.rowIndex);
      }
    } else {
      setCellData(data);
      setCustomReaction(false);
    }
    const { x, y } = event.event.target.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    setPopupCords({
      x, y: y >= screenHeight / 2 ?
        y - Number(`${isCustomReaction ? 350 : 125}`) : y
    });
    setPopupVisible(true);
  }

  useEffect(() => {
    fetchMoleculeOrders();
    setSynthesisPopupPosition(popupPositionValue());
  }, []);

  const handleSendForSynthesis = () => {
    setSynthesisView(true);
    setDisableAnalysis(true);
  };

  const handleSendForAnalysis = async () => {
    setSendForSynthesisEnabled(true);
    // Ensure moleculeData is handled as an array of objects
    const selectedMolecule: CreateLabJobOrder[] = moleculeData.map((molecule) => ({
      molecule_id: molecule.molecule_id,
      order_id: Number(molecule.molecule_order_id),
      library_id: molecule.library_id,
      project_id: molecule.project_id,
      organization_id: molecule.organization_id,
      user_id: userData.id,
      assays: molecule.assays,
    }));
    context?.addToState({
      ...appContext,
      cartDetail: [...selectedMolecule]
    });
    const analysis = true;
    // Call addMoleculeToCart with the updated selectedMolecule array
    addMoleculeToCart(selectedMolecule, MoleculeStatusCode.OrderedInCart)
      .then(async (res) => {
        if (res) {
          await updateMoleculeStatus(moleculeData, MoleculeStatusCode.OrderedInCart,
            userData.id, analysis);
          toast.success(Messages.ANALYSIS_ORDER);
          setMoleculeStatus(moleculeData, MoleculeStatusLabel.OrderedInCart)
        }
      })
      .catch((error) => {
        toast.error(error.message || 'An error occurred', {
          position: 'top-center',
        });
      });
    setSelectedRows([]);
    setMoleculeData([]);
  };

  const setMoleculeStatus = (moleculeArray: MoleculeOrder[], value: MoleculeStatusLabel) => {
    const newMolecules = moleculeOrderData?.map((molecule: MoleculeOrder) => {
      if (moleculeArray.some(mol => mol?.molecule_id === molecule?.molecule_id)) {
        return { ...molecule, molecule_status: value };
      }
      return molecule;
    });
    setMoleculeOrderData(newMolecules);
  }

  const generateReactionPathwayWithSocket = async () => {
    setSendForSynthesisEnabled(true);
    setLoader(true);
    const toastId = toast(Messages.sentForSynthesis(moleculeData.length), {
      icon: 'ℹ️',
      style: {
        background: '#FFC832',
      }
    });
    await delay(DELAY);
    toast.remove(toastId);
    const orderedData: any = groupOrders(moleculeData)
    const formData: GeneratePathwayType = {
      submittedBy: userData.id,
      submittedAt: new Date().toISOString(),
      submittedMolecules: orderedData
    };
    console.log(formData, "formData");
    const response = await generatePathway(formData);
    console.log(response, "RESPONSE")
    if (response.status === 200) {
      setMoleculeStatus(moleculeData, MoleculeStatusLabel.InRetroQueue);
      setToIntroQueue(moleculeData);
      await updateMoleculeStatus(moleculeData, MoleculeStatusCode.InRetroQueue, userData.id);
      const messageIds: string[] = [...pathwayKeys];
      messageIds.push(response.error.message_id);
      setPathwayKeys(messageIds);
    }
    else {
      const toastId = toast.error('error in synthesis');
      await delay(DELAY);
      toast.remove(toastId);
    }
  }

  const generateReactionPathwayWithMock = async () => {
    setSendForSynthesisEnabled(true);
    setLoader(true);
    const toastId = toast(Messages.sentForSynthesis(moleculeData.length), {
      icon: 'ℹ️',
      style: {
        background: '#FFC832',
      }
    });
    await delay(DELAY);
    toast.remove(toastId);

    setMoleculeStatus(moleculeData, MoleculeStatusLabel.InRetroQueue);
    setToIntroQueue(moleculeData);
    await updateMoleculeStatus(moleculeData, MoleculeStatusCode.InRetroQueue, userData.id);
    setSelectedRows([]);
      extractJsonData({
        molecules: moleculeData, id: userData.id, setLoader, setMoleculeStatus
      });
    setMoleculeData([]);
    setDisableAnalysis(false);
  }


  const generateReactionPathway = () => {
    if (process.env.NEXT_PUBLIC_ENABLE_RETRO_SYNTHESIS_PROCEDURE_PREDICTION_WEBSOCKET === 'TRUE') {
      generateReactionPathwayWithSocket();
    } else {
      generateReactionPathwayWithMock();
    }
  }

  const onSelectionUpdated = (selectedRowsKeys: number[], selectedRowsData: object[]) => {
    setSelectedRows(selectedRowsKeys);
    setMoleculeData(selectedRowsData as MoleculeOrder[]);
    if (selectedRowsKeys.length) {
      setSendForSynthesisEnabled(false)
    } else {
      setSendForSynthesisEnabled(true)
    }
  }

  /* const onSelectionChanged = async (e: SelectionChangedEvent) => {
    // disable selecting certain rows
    const deselectRowKeys: number[] = [];
    e.selectedRowsData.forEach((item) => {
      if (!isSelectable.includes(item.molecule_status)) {
        deselectRowKeys.push(e.component.keyOf(item));
      }
    });
    if (deselectRowKeys.length) {
      e.component.deselectRows(deselectRowKeys);
    }
    selectionRef.current.checkBoxUpdating = true;
    const selectAllCheckBox = selectionRef.current.selectAllCheckBox;
    selectAllCheckBox?.option("value", isSelectAll(e.component));
    selectionRef.current.checkBoxUpdating = false;
    const selectedRows = e.selectedRowKeys.filter(key => !deselectRowKeys.includes(key));
    setSelectedRows(selectedRows)
    if (selectedRows.length > 0) {
      setSendForSynthesisEnabled(false)
    }
    else {
      setSendForSynthesisEnabled(true)
    }
    const selectedProjectMolecule: MoleculeOrder[] = e.selectedRowsData.filter(value =>
      !deselectRowKeys.includes(value.id)).map((item: any) => ({
        ...item,
        order_id: item.order_id,
        molecule_id: item.molecule_id,
        library_id: item.library_id,
        user_id: userData.id,
        organization_id: item.organization_id,
        project_id: item.project_id
      }));
    setMoleculeData(selectedProjectMolecule);
  } */

  useEffect(() => {
    if (selectedMoleculeOrder[0]?.molecule_status === MoleculeStatusLabel.InProgress &&
      selectedPathwayIndex === -1
    ) {
      setPathwayWidth(popupWidth - 42);
      setUpdatedAt(Date.now());
    } else {
      setPathwayWidth(popupWidth - 50);
      setUpdatedAt(Date.now());
    }
  }, [popupWidth, pathwayView, reactionOnlyView, selectedPathwayIndex]);

  const toolbarButtons = [
    {
      text: `Send for Analysis (${selectedRows.length})`,
      onClick: handleSendForAnalysis,
      disabled: (selectedRows?.length > 0 && !disableAnalysis) ? false : true,
      class: (selectedRows?.length > 0 && !disableAnalysis) ?
        'btn-primary mr-2' : 'mol-ord-btn-disable mr-2',
      visible: permitSubmitAnalysis
    },
    {
      text: `Send for Processing (${selectedRows.length})`,
      onClick: handleSendForSynthesis,
      disabled: isSendForSynthesisEnabled,
      class: isSendForSynthesisEnabled ? 'mol-ord-btn-disable' : 'btn-primary',
      visible: permitSumbitSynthesis
    }
  ];

  /* const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {
    // Handling cart molecules
    if (isMoleculeInCart.includes(e.key)) {
      e.cellElement.style.pointerEvents = 'none';
      e.cellElement.style.opacity = '0.5';
    }
  }; */


  // Fetch Reaction Data
  const fetchData = async (id: string, idx: number) => {
    try {
      const pathwayReactionData = await getReactionPathway(Number(selectedMoleculeId), id);
      setPathWayReaction(pathwayReactionData?.data)
      if (pathwayReactionData.data[0]) {
        const modifiedReactionData: Reaction[] = pathwayReactionData.data[0].reaction_detail || [];
        // Create a shallow copy and reverse it
        setReactionsData(modifiedReactionData || []);
        if (modifiedReactionData?.length) {
          const count = modifiedReactionData?.length + 1;
          const noOfTabState = Array(count).fill(false);
          setSubmittedTabs(noOfTabState);
          setFormStates(noOfTabState);
        }
        setSelectedPathway(idx);
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching data:', error);
    }
  };

  const handleSaveReaction = async (type: number) => {
    setResetReaction(ResetState.SUBMIT);
    setPopUpType(FormState.DEFAULT);
    const { molecule_status } = selectedMoleculeOrder[0];
    const moleculeStatus = isProtocolAproover(myRoles) || isSystemAdmin(myRoles) ?
      MoleculeStatusCode.Validated : MoleculeStatusCode.InReview;
    const moleculeStatusLabel = isProtocolAproover(myRoles)
      || isSystemAdmin(myRoles) ? MoleculeStatusLabel.Validated : MoleculeStatusLabel.InReview;
    const reactionStatus = isProtocolAproover(myRoles) || isSystemAdmin(myRoles) ?
      ReactionStatus.Ready : ReactionStatus.Reviewed;
    setIsLoading(true);
    // in reactant list save button returns
    if (activeTab === tabsDetails?.length - 1) {
      const res: any = await updateMoleculeDataStatus(moleculeStatus, moleculeStatusLabel);
      handleTabActions();
      if (isResearcher(myRoles) && !isProtocolAproover(myRoles) &&
        molecule_status === MoleculeStatusLabel.Ready && res) {
        toast.success(Messages.UPDATE_PATHWAY_REACTION, {
          position: 'top-center'
        });
      } else {
        toast.success(Messages.UPDATE_PATHWAY_REACTION_VALIDATE, {
          position: 'top-center'
        });
      }
      handleTabActions();
      setIsLoading(false);
      return;
    }
    const reactionNo = activeTab + 1;
    const message = type === ReactionButtonNames.SAVE ?
      Messages.REACTION_SAVE_MSG(reactionNo, pathwayID) :
      Messages.REACTION_VALIDATE_MSG(reactionNo, pathwayID);
    const { id, temperature, solvent } = reactionDetail || {};
    setConfirm(false);
    const selectedPathway: SelectedPathwayInstance = pathwayReaction[0];
    const pathway_instance_id = selectedPathway?.pathway_instance_id;
    const pathwayId = selectedPathway?.id;
    const payload = {
      data: {
        id: id,
        temperature: Number(temperature),
        solvent: solvent,
        status: reactionStatus,
        created_by: userData.id,
        pathwayId,
      },
      molecules: moleculeCompound,
    };
    if (pathway_instance_id === 0 && isEditpathWay) {
      const data = insertPathWayInstance(selectedPathway, payload);
      const extractedReactionData = data.reaction_detail.map((data: any) => ({
        reaction_template: data.reaction_template_master.reaction_template.reaction_type,
        reaction_sequence_no: data.reaction_sequence_no,
        reaction_name: data.reaction_name,
        pathway_instance_id: data.pathway_instance_id,
        reaction_sequence: data.reaction_sequence_no,
        confidence: data.confidence,
        temperature: data.temperature,
        solvent: data.solvent,
        product_smiles_string: data.product_smiles_string,
        reaction_smiles_string: data.reaction_smiles_string,
        product_type: data.product_type,
        status: 2,
        created_by: data.created_by,
        reaction_compound: data.reaction_compound,
      }));
      const reactionDataInput: PathwayType[] = [{
        id: data.id,
        molecule_id: data.molecule_id,
        parent_id: Number(data.parent_id),
        pathway_instance_id: 1,
        pathway_index: data.pathway_index,
        pathway_score: data.pathway_score,
        selected: data.selected,
        created_by: data.created_by,
        reaction_detail: extractedReactionData,
        updated_by: userData.id
      }];
      try {
        const insertedData = await saveReactionPathway(reactionDataInput);
        context?.addToState({
          ...appContext,
          pathwayReaction: insertedData[0]
        })
        setPathWayReaction(insertedData);
        await fetchData(insertedData[0]?.id, selectedPathwayIndex);
        // await updateMoleculeDataStatus(moleculeStatus, moleculeStatusLabel)
        setMoleculeCompound([]);
        handleTabActions();
        toast.success(message, {
          position: 'top-center'
        });
        setIsLoading(false);
        setPathwayData(JSON.parse(JSON.stringify(nodeValue[selectedPathwayIndex])));
      } catch (err: any) {
        if (err) {
          toast.error(err);
          setIsLoading(false);
        }
      }
    }
    else {
      const response = await updateReaction(payload);
      if (response) {
        // await updateMoleculeDataStatus(moleculeStatus, moleculeStatusLabel)
        setMoleculeCompound([]);
        handleTabActions();
        setPathwayData(JSON.parse(JSON.stringify(nodeValue[selectedPathwayIndex])));
        toast.success(message, {
          position: 'top-center'
        });
        setIsLoading(false);
      }
    }
  };

  const insertPathWayInstance = (selectedPathway: SelectedPathwayInstance, payload: any) => {
    const newObj = JSON.parse(JSON.stringify(selectedPathway));
    newObj.pathway_instance_id = 1;
    newObj.parent_id = newObj.id;
    const reactionDetail = newObj.reaction_detail.find((reaction: any) =>
      reaction.id === payload.data.id
    );

    if (reactionDetail) {
      reactionDetail.reaction_sequence_no = reactionDetail.reaction_sequence_no;
      reactionDetail.temperature = payload.data.temperature;
      reactionDetail.solvent = payload.data.solvent;
      reactionDetail.pathway_instance_id = 1;
      reactionDetail.reaction_compound.forEach((compound: any) => {
        compound.pathway_instance_id = 1
        const matchingMolecule = payload.molecules.find(
          (molecule: any) => molecule.id === compound.id);
        if (matchingMolecule) {
          compound.molar_ratio = matchingMolecule.molar_ratio ?? compound.molar_ratio;
          compound.dispense_time = matchingMolecule.dispense_time ?? compound.dispense_time;
          compound.compound_label = matchingMolecule.compound_label ?? compound.compound_label;
          compound.compound_name = matchingMolecule.compound_name ?? compound.compound_name;
          compound.smiles_string = matchingMolecule.smiles_string ?? compound.smiles_string
        }
      });
    }
    return newObj
  }

  const handleDataChange = (input: ReactionInputData[]) => {
    onFormChange(true);
    setMoleculeCompound(prevState => {
      const updatedState = [...prevState];
      input.forEach(item => {
        const existingCompoundIndex = updatedState.findIndex(compound => compound.id === item.id);
        if (existingCompoundIndex !== -1) {
          updatedState[existingCompoundIndex] = {
            ...updatedState[existingCompoundIndex],
            ...item,
          };
        } else {
          updatedState.push({
            ...item,
          });
        }
      });
      return updatedState;
    });
  };

  // update reaction when compounds swapped
  const handleSwapReaction = (reagentCompounds: ReactionCompoundType[]) => {
    const [first, second] = reagentCompounds;
    const tempNode = [...nodeValue[selectedPathwayIndex]];
    const firstIndex = tempNode.findIndex(node => Number(node.id) === Number(first.id));
    const secondIndex = tempNode.findIndex(node => Number(node.id) === Number(second.id));
    const tempNodeData = tempNode[firstIndex];
    tempNode[firstIndex] = tempNode[secondIndex];
    tempNode[secondIndex] = tempNodeData;
    setNodes(prevState => {
      const updatedState = [...prevState];
      updatedState[selectedPathwayIndex] = tempNode;
      return updatedState;
    })
    setUpdatedKey('molecule');
  }

  const handleSolventChange = (solvent: string) => {
    // update reaction
    onFormChange(true);
    const tempNode = [...nodeValue[selectedPathwayIndex]];
    const nodeIndex = reactionIndexList[selectedPathwayIndex].pathIndex[activeTab];
    const conditions = tempNode[nodeIndex].condition?.split(',') || [];
    conditions[0] = solvent;
    tempNode[nodeIndex].condition = conditions.join(',');
    setNodes(prevState => {
      const updatedState = [...prevState];
      updatedState[selectedPathwayIndex] = tempNode;
      return updatedState;
    })
    setUpdatedKey('node');

    setReactionDetail((prevState) => {
      if (prevState) {
        return {
          ...prevState,
          solvent: solvent,
        };
      }
      // If prevState is undefined, return a default object or handle the case
      return {
        id: '',
        temperature: 0,
        solvent: solvent,
        reactionTemplate: '',
      };
    });
  };


  const handleTemperatureChange = (temperature: number) => {
    // update reaction
    onFormChange(true);
    const tempNode = [...nodeValue[selectedPathwayIndex]];
    const nodeIndex = reactionIndexList[selectedPathwayIndex].pathIndex[activeTab];
    const conditions = tempNode[nodeIndex].condition?.split(',') || [];
    conditions[1] = `${temperature}°C`;
    tempNode[nodeIndex].condition = conditions.join(',');
    setNodes(prevState => {
      const updatedState = [...prevState];
      updatedState[selectedPathwayIndex] = tempNode;
      return updatedState;
    })
    setUpdatedKey('node');

    setReactionDetail((prevState) => {
      // Ensure prevState is not undefined before spreading
      if (prevState) {
        return {
          ...prevState,
          temperature: temperature,
        };
      }
      // If prevState is undefined, return a default object or handle the case
      return {
        id: '',
        temperature: temperature,
        solvent: '',
        reactionTemplate: '',
      };
    });
  };

  // Use useMemo to calculate consolidatedReagents to avoid recalculating on every render
  const consolidatedReagents: ReactionCompoundType[] = useMemo(() => {
    return reactionsData?.flatMap((reaction, index) =>
      reaction.reaction_compound
        .filter((compound: ReactionCompoundType) => compound.compound_type === COMPOUND_TYPE_R)
        .map((compound: ReactionCompoundType) => ({
          ...compound,
          related_to: index + 1,
          link: "NA",
        }))
    );
  }, [reactionsData]);

  useEffect(() => {
    const updateSmilesLinks = async () => {
      const payload = {
        smiles: consolidatedReagents.map((item: ReactionCompoundType) => item?.smiles_string),
      };
      try {
        const apiData: AmsInventoryItem[] = await searchInventory(payload);
        const updatedData: ReactionCompoundType[] = consolidatedReagents.map((item) => {
          const apiItem = apiData?.find(
            (responseItem: any) => responseItem?.smiles === item?.smiles_string
          );
          return {
            ...item,
            link: apiItem?.details?.link || "NA", // Default to "NA" if no link found
            status: apiItem?.status || false,
            source: apiItem?.details?.source || "",
          };
        });
        setReactantList(updatedData);
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    if (consolidatedReagents.length) {
      updateSmilesLinks();
    }
  }, [consolidatedReagents]);

  useEffect(() => {
    const handlePathwayReactionOpen = async () => {
      try {
        if (!Array.isArray(nodeValue)) {
          toast(Messages.NO_PATHWAYS, {
            icon: <Image src="/icons/warning-sign.svg" alt="warning"
              width={18} height={18} />,
          });
          return;
        }

        // Find the index of the first array containing an object with pathway_instance_id: 1
        const validSelectedPathwayIndex = nodeValue.findIndex(
          (subArray: any) =>
            Array.isArray(subArray) &&
            subArray.some((node: any) => node?.pathway_instance_id === 1)
        );

        // Ensure the index is valid before updating state
        if (validSelectedPathwayIndex !== -1) {
          await handleOpenClick(validSelectedPathwayIndex);
        } else {
          setSelectedPathway(-1);
        }
      } catch {
        toast.error(Messages.ERROR_PATHWAYS)
      }
    };

    if (reactionOnlyView) {
      handlePathwayReactionOpen();
    }
  }, [nodeValue, reactionOnlyView]);


  const tabsDetails: TabDetail[] = [
    ...reactionsData.map((reaction, index) => {
      const reactionColor: ReactionColorsType =
        `R${index + 1}` as ReactionColorsType;
      return {
        title: `Reaction ${index + 1}`,
        Component: ReactionDetails,
        props: {
          isReactantList: false,
          data: reaction,
          onDataChange: handleDataChange,
          onSolventChange: handleSolventChange,
          onTemperatureChange: handleTemperatureChange,
          setReactionDetail: setReactionDetail,
          handleSwapReaction: handleSwapReaction,
          resetReaction,
          status: selectedMoleculeOrder[0].molecule_status,
          color: ReactionColors[reactionColor]
        },
      }
    }) || [],
    {
      title: 'Reactant List',
      Component: ReactionDetails,
      props: {
        isReactantList: true,
        data: reactantList,
      },
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && tabsDetails?.length !== undefined) {
      localStorage.setItem("tabsLength", String(tabsDetails.length));
    }
  }, [tabsDetails]);

  const onFormChange = (hasChanged: boolean) => {
    setPopUpType(FormState.UPDATE);
    const updatedFormStates = [...formStates];
    const updatedSubmittedTabs = [...submittedTabs];
    updatedFormStates[activeTab] = hasChanged;
    updatedSubmittedTabs[activeTab] = !hasChanged;
    setFormStates(updatedFormStates);
    setSubmittedTabs(updatedSubmittedTabs);
  };

  // Handle tab submission
  const handleTabActions = () => {
    const updatedSubmittedTabs = [...submittedTabs];
    const updatedFormStates = [...formStates];
    updatedSubmittedTabs[activeTab] = true;
    updatedSubmittedTabs[tabsDetails.length - 1] = activeTab === tabsDetails.length - 1;
    updatedFormStates[activeTab] = false;
    setSubmittedTabs(updatedSubmittedTabs);
    setFormStates(updatedFormStates);

    // Navigate to the next tab
    if (nextReaction && activeTab < tabsDetails.length - 1) {
      setActiveTab(activeTab + 1);
      setUpdatedKey('currentReaction');
    }
  };

  // Check if the last tab's button should be enabled
  const isLastTabEnabled = () => {
    const allPreviousTabsValidated = submittedTabs.slice(0, -1).every((submitted) => submitted);
    const isLastTabNotSubmitted = !submittedTabs[tabsDetails.length - 1];
    return allPreviousTabsValidated && isLastTabNotSubmitted;
  };

  // Check if all tabs are validated
  const isAllTabsValidated = () => {
    return submittedTabs.every((validated) => validated);
  };

  const handleNextReaction = (Checked: boolean) => {
    setNextReaction(Checked);
  };

  const handleOpenClick = async (index: number, tab?: number) => {
    // need to fetch by id since the index in which path show will not 
    // match the actual pathway_index once pathway_instance_id is generated
    const nodeValuepathwayId = nodeValue[index][1].id.split('R')[0];
    const pathwayId = nodeValue[index][1].id.split('R')[0] ===
      appContext?.pathwayReaction?.parent_id
      ? appContext.pathwayReaction.id : nodeValuepathwayId;
    setPathwayID(Number(pathwayId));
    setEditPathway(true)
    setActiveTab(tab || 0);
    setLoadingButtonIndex(index);
    await fetchData(pathwayId, index);
    setPathwayData(JSON.parse(JSON.stringify(nodeValue[index])));
    setLoadingButtonIndex(null);
    setPathwayWidth(popupWidth - 50);
    setUpdatedAt(Date.now());
  };

  const selectedReaction = (eventSource: number, pathwayIndex: number) => {
    const tab = eventSource - 1;
    //open a pathway if itsnt already open
    if (selectedPathwayIndex === -1) {
      handleOpenClick(pathwayIndex, tab);
    }
    setActiveTab(tab);
    setUpdatedKey('currentReaction');
  }

  const handleResize = (e: any) => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (e.component.option("width") >= PATHWAY_BOX_WIDTH)
        setPopupWidth(e.component.option("width"));
      else setPopupWidth(PATHWAY_BOX_WIDTH);
      setUpdatedAt(Date.now());
    }, 500);
  };

  const onRowClick = (e: RowClickEvent) => {
    if (e.rowType === 'data') {
      const rowData = e.data;
      if (!buttonClicked) {
        const customReaction = isCustomReactionCheck(rowData.projectMetadata)
        const isClickableRow = clickableRow(rowData) || customReaction;
        if (isClickableRow) {
          if (rowData.molecule_status === MoleculeStatusLabel.Validated ||
            isCustomReactionCheck(rowData.projectMetadata)) {
            setReactionOnlyView(true);
            if (customReaction) {
              if (rowData.molecule_status === MoleculeStatusLabel.Ordered) {
                setCustomReaction(true);
              }
            }
          }
          setLocalPath(rowData);
          setEditPathway(true);
          setSelectedMoleculeOrder([rowData]);
          setActiveTab(0);
          setNextReaction(false);
          if (!rowData.disabled) {
            setSelectRow(e.rowIndex);
          }
        }
      }
    }
  };

  const onRowPrepared = (e: any) => {
    if (e.rowType === 'data') {
      if (e.rowType === 'data' &&
        (e.data.molecule_status === MoleculeStatusLabel.Ready ||
          e.data.molecule_status === MoleculeStatusLabel.InRetroQueue ||
          e.data.molecule_status === MoleculeStatusLabel.Validated ||
          e.data.molecule_status === MoleculeStatusLabel.ValidatedInCart ||
          e.data.molecule_status === MoleculeStatusLabel.OrderedInCart ||
          e.data.molecule_status === MoleculeStatusLabel.InProgress ||
          e.data.molecule_status === MoleculeStatusLabel.Done
        )) {
        e.data.disabled = true;
      }
      const isClickableRow = clickableRow(e.data) || isCustomReactionCheck(e.data.projectMetadata);
      if (isClickableRow) {
        e.rowElement.style.cursor = 'pointer';
        if (selectedRow === e.rowIndex)
          e.rowElement.style.backgroundColor = 'var(--rowHoverColor)';
      }
    }
  };


  let isValidateButtonEnabled = false;
  let isResearchButton = false;
  if (selectedMoleculeOrder.length) {
    const { molecule_status } = selectedMoleculeOrder[0];
    isValidateButtonEnabled = (() => {
      if (isSystemAdmin(myRoles) || isResearcherAndProtocolAproover(myRoles)) {
        const statusList = [
          MoleculeStatusLabel.Ready,
          MoleculeStatusLabel.InReview,
          MoleculeStatusLabel.Validated
        ];
        return statusList.includes(molecule_status);
      }
      else if (isProtocolAproover(myRoles)) {
        const statusList = [
          MoleculeStatusLabel.InReview,
          MoleculeStatusLabel.Validated
        ];
        return statusList.includes(molecule_status);
      }
      return false;
    })();

    isResearchButton = isResearcher(myRoles) &&
      molecule_status === MoleculeStatusLabel.Ready;
  }

  const resetNodes = (showOuter?: boolean) => {
    setPopUpType(FormState.DEFAULT);
    setNodes(prevState => {
      const updatedState = [...prevState];
      updatedState[selectedPathwayIndex] =
        JSON.parse(JSON.stringify(pathwayDataLocal));
      return updatedState;
    });
    setUpdatedAt(Date.now());
    if (showOuter) {
      setActiveTab(0);
      setNextReaction(false);
      setIsLabJobLoading(false);
      setIsLoading(false);
      setSelectedPathway(-1);
      setPathwayWidth(popupWidth - 50);
      setUpdatedAt(Date.now());
    } else {
      setResetReaction((prev) => prev + 1);
      const updatedSubmittedTabs = [...submittedTabs];
      updatedSubmittedTabs[activeTab] = false;
      setSubmittedTabs(updatedSubmittedTabs);
    }
  }

  const handlePathwayList = () => {
    setReactionOnlyView(false);
    setHideOpen(false);
    if (popUpType === FormState.UPDATE) {
      setConfirm(true);
    } else {
      setSelectedPathway(-1);
    }
  };


  const removeSynthesisData = (data: MoleculeOrder) => {
    const updateSelectedRows = selectedRows.filter
      ((item: number) => Number(item) !== Number(data.id));
    const updatedData = moleculeData.filter((item) => item.molecule_id !== data.molecule_id);
    setMoleculeData(updatedData);
    setSelectionEnabledRows(updatedData);
    if (!updatedData.length) {
      setSynthesisView(false);
    }
    onSelectionUpdated(updateSelectedRows, updatedData);
  }

  const [gridHeight, setGridHeight] = useState(typeof window !== 'undefined' ?
    window.innerHeight - 100 : 'auto');

  const adjustGridHeight = () => {
    const newHeight = window.innerHeight; // Subtract any offset if needed
    setGridHeight(newHeight);
  };

  useEffect(() => {
    // Adjust height when the window is resized
    window.addEventListener('resize', adjustGridHeight);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', adjustGridHeight);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="pt-[10px]">
        <main className="main main-title pl-[20px]">
          <Image src="/icons/molecule-order.svg" width={33} height={30} alt="Project logo" />
          <span>Molecule Orders</span>
        </main>
        <div className="p-[20px]" onClick={closeMagnifyPopup}>
          <CustomDataGrid
            columns={orderColumns}
            onRowClick={onRowClick}
            data={moleculeOrderData}
            height={gridHeight}
            groupingColumn={rowGroupName()}
            enableRowSelection
            enableGrouping
            enableSorting
            enableFiltering={false}
            enableOptions={false}
            toolbarButtons={toolbarButtons}
            loader={loader}
            enableHeaderFiltering
            enableSearchOption
            selectionEnabledRows={selectionEnabledRows}
            cssClass='molecule-order-list'
            onSelectionUpdated={onSelectionUpdated}
            onRowPrepared={onRowPrepared}
            showFooter={true}
            selectedRow={selectedRows}
          />
        </div>

        {synthesisView &&
          <Popup
            title='Send Molecules for Processing?'
            visible={synthesisView}
            contentRender={() => (
              <SendMoleculesForSynthesis
                moleculeData={moleculeData}
                generateReactionPathway={generateReactionPathway}
                setSynthesisView={setSynthesisView}
                setDisableAnalysis={setDisableAnalysis}
                inRetroData={inRetroData}
                closeMagnifyPopup={closeMagnifyPopup}
                handleStructureZoom={handleStructureZoom}
                removeSynthesisData={(data: MoleculeOrder) => removeSynthesisData(data)}

              />
            )}
            width={700}
            hideOnOutsideClick={false}
            height="100%"
            dragEnabled={false}
            position={synthesisPopupPos}
            onHiding={() => {
              context?.addToState({
                ...appContext,
                pathwayReaction: {}
              })
              setPopupVisible(false);
              setSynthesisView(false);
              setDisableAnalysis(false);
              setReactionOnlyView(false);
            }}
            showCloseButton={true}
            wrapperAttr={
              {
                class: "create-popup mr-[15px]"
              }
            }
          />
        }
  
        {pathwayView &&
          <Popup
            title='Pathway Selection'
            visible={pathwayView}
            contentRender={() => (
              <div className="bg-themelightGreyColor relative p-[16px]">
                {!reactionOnlyView &&
                  <span className="pathway-header">
                    {selectedPathwayIndex === -1 && `${nodeValue.length} Pathway(s) found`}
                  </span>
                }
                <div>
                  {selectedPathwayIndex !== -1 &&
                    <div className="flex justify-between">
                      <span className="pathway-header">
                        {`Pathway ID: ${nodeValue[selectedPathwayIndex][1].id.split('R')[0]}`}
                      </span>
                      <Button
                        className="btn-secondary"
                        text="Pathway List"
                        icon="/icons/back-icon.svg"
                        onClick={handlePathwayList}
                      />
                    </div>
                  }
                  {nodeValue?.length > 0 && (
                    <div style={{
                    }}>{
                        nodeValue.map((node, idx) => {
                          if ((selectedPathwayIndex === -1 || selectedPathwayIndex === idx)) {
                            const showLoader = loadingButtonIndex === idx;
                            return (
                              <div key={`node-${idx}`} className="mt-[10px] mb-[10px]">
                                <div>
                                  {((selectedPathwayIndex === -1) && hideOpen) &&
                                    <div style={{ textAlign: 'right', padding: '10px' }}
                                      className="bg-white">
                                      <button className={showLoader
                                        ? 'disableButton w-[53px] h-[37px]'
                                        : 'primary-button'}
                                        onClick={() => {
                                          handleOpenClick(idx);
                                        }}>
                                        <LoadIndicator className="button-indicator"
                                          visible={showLoader}
                                          height={20}
                                          width={20} />
                                        {showLoader ? '' : 'Open'}
                                      </button>
                                    </div>
                                  }
                                </div>
                                <PathwayImage pathwayId={`node-${idx}`} nodes={node}
                                  key={`node-${idx}-${updatedAt}`}
                                  style={{ position: 'relative', background: "#fff" }}
                                  width={pathwayWidth}
                                  height={300}
                                  currentReaction={activeTab}
                                  updatedKey={updatedKey}
                                  updatedAt={updatedAt}
                                  setHideOpen={setHideOpen}
                                >
                                  <PathwayAction pathwayId={`node-${idx}`}
                                    selectedReaction={selectedReaction} updatedAt={updatedAt} />
                                </PathwayImage>
                                {selectedPathwayIndex === idx && (
                                  <div className="border border-[var(--themeSecondaryGreyColor)] 
                        bg-white shadow-[0px_-3px_1px_rgb(190_185_185_/_90%)] pb-[38px]">
                                    <Tabs tabsDetails={tabsDetails} activeTab={activeTab}
                                      onSelectedIndexChange={(tabIndex: number) => {
                                        setActiveTab(tabIndex);
                                        setUpdatedKey('currentReaction');
                                      }}
                                    />
                                    {/* Bottom Fixed Section */}
                                    <div className={`fixed bottom-0 left-0 right-0 
                                    bg-themelightGreyColor py-[16px] pr-[40px] pl-[24px]
                                    border-t flex justify-between`}>
                                      <div className="flex items-center gap-4">
                                        {isValidateButtonEnabled &&
                                          <>
                                            <Button
                                              disabled={isLoading ||
                                                (submittedTabs[activeTab] &&
                                                  !formStates[activeTab]) ||
                                                (activeTab === tabsDetails.length - 1
                                                  && !isLastTabEnabled())
                                              }
                                              onClick={() => {
                                                handleSaveReaction(ReactionButtonNames.VALIDATE);
                                              }}
                                              className={
                                                isLoading || ((submittedTabs[activeTab] &&
                                                  !formStates[activeTab]) ||
                                                  (activeTab === tabsDetails.length - 1
                                                    && !isLastTabEnabled()))
                                                  ? "mol-ord-btn-disable btn-primary w-[100px]"
                                                  : "btn-primary w-[100px]"
                                              }
                                              text={isLoading ? '' : 'Validate'}
                                              visible={permitValidatePathway}
                                              style={{
                                                cursor: isLoading ?
                                                  'default' : 'pointer'
                                              }}
                                            >
                                              {isLoading && (
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
                                            </Button>
                                            <Button disabled={
                                              (submittedTabs[activeTab] &&
                                                !formStates[activeTab]) ||
                                              (activeTab === tabsDetails.length - 1
                                                ? !isLastTabEnabled()
                                                : false)
                                            }
                                              text="Reset"
                                              onClick={async () => resetNodes()}
                                              className={
                                                (submittedTabs[activeTab] &&
                                                  !formStates[activeTab]) ||
                                                  (activeTab === tabsDetails.length - 1
                                                    ? !isLastTabEnabled()
                                                    : false)
                                                  ? "mol-ord-btn-disable btn-secondary"
                                                  : "btn-secondary"
                                              }
                                            />
                                          </>
                                        }
                                        {isResearchButton && !isValidateButtonEnabled &&
                                          <>
                                            <Button
                                              disabled={
                                                (isLoading || submittedTabs[activeTab] &&
                                                  !formStates[activeTab]) ||
                                                (activeTab === tabsDetails.length - 1
                                                  ? !isLastTabEnabled()
                                                  : false)
                                              }
                                              text={isLoading ? '' : 'Save'}
                                              onClick={() => {
                                                setConfirm(true);
                                                setPopUpType(FormState.DEFAULT);
                                              }}
                                              className={isLoading || (submittedTabs[activeTab] &&
                                                !formStates[activeTab]) ||
                                                (activeTab === tabsDetails.length - 1
                                                  && !isLastTabEnabled())
                                                ? "mol-ord-btn-disable btn-primary w-[75px]"
                                                : "btn-primary w-[75px]"
                                              }
                                              visible={permitEditReaction}
                                              style={{
                                                cursor: isLoading ?
                                                  'default' : 'pointer'
                                              }}

                                            >
                                              {isLoading && (
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
                                            </Button>

                                            <Button disabled={
                                              (submittedTabs[activeTab] &&
                                                !formStates[activeTab]) ||
                                              (activeTab === tabsDetails.length - 1
                                                ? !isLastTabEnabled()
                                                : false)
                                            }
                                              text="Reset"
                                              onClick={async () => resetNodes()}
                                              className={
                                                (submittedTabs[activeTab] &&
                                                  !formStates[activeTab]) ||
                                                  (activeTab === tabsDetails.length - 1
                                                    ? !isLastTabEnabled()
                                                    : false)
                                                  ? "mol-ord-btn-disable btn-secondary"
                                                  : "btn-secondary"
                                              }
                                            />
                                          </>}
                                        {(permitEditReaction && (isValidateButtonEnabled
                                          || isResearchButton)) &&
                                          <label className="flex items-center">
                                            <CheckBox
                                              disabled={activeTab === tabsDetails.length - 1}
                                              value={nextReaction}
                                              elementAttr={{ 'aria-label': 'Next Reaction' }}
                                              onValueChanged={(e) =>
                                                handleNextReaction(e.value)}
                                              className={nextReaction ? 'bg-themeBlueColor'
                                                : 'bg-white'}
                                            />
                                            <span className="ml-2 text-themeBlueColor">
                                              Next Reaction
                                            </span>
                                          </label>}
                                      </div>
                                      <div className="flex">
                                        <div className="flex items-center gap-4 mr-[10px]">
                                          {[...Array(tabsDetails?.length)].map((_, i) => {
                                            const reactionColor: ReactionColorsType =
                                              `R${i + 1}` as ReactionColorsType;
                                            const isSubmitted = submittedTabs[i];
                                            const isLastTab = i === tabsDetails.length - 1;

                                            return (
                                              <div
                                                key={i}
                                                className={`w-[25px] h-[25px] rounded-full flex 
                                                  items-center justify-center ${isLastTab ?
                                                    "bg-lightGrey text-white" : "text-white"
                                                  }`}
                                                style={{
                                                  backgroundColor: isLastTab
                                                    ? undefined
                                                    : isSubmitted
                                                      ? '#ccc' : ReactionColors[reactionColor]
                                                }}
                                              >
                                                {isSubmitted && !isLastTab ? (
                                                  <Image
                                                    src="icons/tick-mark.svg"
                                                    alt="tick-mark"
                                                    height={25}
                                                    width={25}
                                                  />
                                                ) : (
                                                  isLastTab ? 'L' : i + 1
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {isValidateButtonEnabled &&
                                          <Button
                                            disabled={!isAllTabsValidated() || isLabJobLoading}
                                            onClick={createLabJobOrder}
                                            visible={permitSubmitLabJob}
                                            className={(isLabJobLoading ||
                                              !isAllTabsValidated())
                                              ? "mol-ord-btn-disable btn-primary w-[160px]"
                                              : "btn-primary w-[160px]"
                                            }
                                            text={isLabJobLoading ? '' : 'Send For Lab Job'}
                                            style={{
                                              cursor: isLabJobLoading ?
                                                'default' : 'pointer'
                                            }}
                                          >
                                            {isLabJobLoading && (
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
                                          </Button>
                                        }
                                      </div>
                                    </div>
                                    {/* ConfirmationDialog with onSave handler */}
                                    <ConfirmationDialog
                                      description={popUpType === 1 ?
                                        Messages.DISCARD_CHANGES :
                                        Messages.SAVE_CHANGES
                                      }
                                      onSave={() => {
                                        if (popUpType === 1) {
                                          resetNodes(true);
                                        } else {
                                          handleSaveReaction(ReactionButtonNames.SAVE);
                                        }
                                      }}
                                      openConfirmation={confirm}
                                      setConfirm={setConfirm}
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          }
                        })}
                    </div>
                  )
                  }
                </div>
              </div>
            )}
            hideOnOutsideClick={false}
            defaultWidth={popupWidth}
            minWidth={PATHWAY_BOX_WIDTH}
            dragEnabled={false}
            resizeEnabled={true}
            onResize={handleResize}
            height="100%"
            minHeight={'100%'}
            position={synthesisPopupPos}
            onHiding={() => {
              context?.addToState({
                ...appContext,
                pathwayReaction: {}
              })
              setPathwayView(false);
              setSelectRow(-1);
              setSelectedPathway(-1);
              setSubmittedTabs([]);
              setFormStates([]);
              setReactionOnlyView(false);
              if (typeof window !== "undefined") {
                localStorage.setItem('pathway_box_width', JSON.stringify(popupWidth));
              }
            }}
            showCloseButton={true}
            wrapperAttr={
              {
                class: "pathway-popup"
              }
            }
          />
        }
        {viewImage && (
          <Popup
            title={selectedMoleculeOrder[0]?.source_molecule_name
              ? `${selectedMoleculeOrder[0]?.source_molecule_name} Analysis`
              : `Analysis`}
            visible={viewImage}
            contentRender={() => (
              <>
                <div className="flex flex-col items-center
                                        justify-center w-full h-full">
                  <div className="flex justify-end w-full">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/images/1001_nmr_image_3.png';
                        link.download = '1001_nmr_image_3.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="primary-button"
                    >
                      Download
                    </button>
                  </div>
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/1001_nmr_image_3.png"
                      alt="Viewed Image"
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </div>
                </div>
              </>
            )}
            resizeEnabled={true}
            hideOnOutsideClick={false}
            defaultWidth={870}
            minWidth={870}
            minHeight={'100%'}
            defaultHeight={'100%'}
            position={{
              my: { x: 'right', y: 'top' },
              at: { x: 'right', y: 'top' },
            }}
            onHiding={() => {
              context?.addToState({
                ...appContext,
                pathwayReaction: {}
              })
              setViewImage(false);
              setReactionOnlyView(false);
            }}
            dragEnabled={false}
            showCloseButton={true}
            wrapperAttr={{
              class: "create-popup mr-[15px]"
            }}
          />
        )}
        {popupVisible && (
          <div
            ref={popupRef}
            style={{
              top: `${popupCords.y}px`,
              left: `${popupCords.x + 225}px`,
              zIndex: 2000,
            }}
            className={`fixed
            ${isCustomReaction ? 'w-[835px] h-[350px]' :
                'transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px]'}
            bg-gray-100
            bg-opacity-80
            z-50
            `}
          >
            <div
              className={`absolute
              ${!isCustomReaction ? `top-1/2
                      left-1/2
                      transform -translate-x-1/2 -translate-y-1/2` : `
                      top-0
                      left-0
                      w-[100%] h-[100%]
                      `}`}
            >
              {isCustomReaction ? (
                <div className="bg-themelightGreyColor relative p-[16px]">
                  <p>{`Molecule Id: ${clickedMolecule}`}</p>
                  <PathwayImage
                    pathwayId={`node-${0}`}
                    nodes={nodeValue[0]}
                    updatedAt={Date.now()}
                    key={`node-${0}`}
                    style={{
                      position: 'relative',
                      background: "#fff"
                    }}
                    width={pathwayWidth}
                    height={300}
                    currentReaction={0}
                  >
                    <PathwayAction
                      pathwayId={`node-${0}`} />
                  </PathwayImage>
                </div>
              ) :
                <MoleculeStructure
                  structure={cellData?.smiles_string}
                  width={200}
                  height={200}
                  svgMode={true}
                  structureName={cellData.source_molecule_name}
                />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};