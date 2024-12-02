/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CustomDataGrid from '@/ui/dataGrid';
import {
  BreadCrumbsObj,
  MoleculeOrder,
  MoleculeLabJob,
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
  ReactionDetailType,
  ReactionDetail,
  CreateLabJobOrder,
} from '@/lib/definition';
import Image from 'next/image';
import { Button, CheckBox, LoadIndicator, Popup } from 'devextreme-react';
import dxDataGrid, { SelectionChangedEvent, EditorPreparingEvent } from 'devextreme/ui/data_grid';
import {
  getMoleculesOrder, saveReactionPathway,
  getReactionPathway, getSolventTemperature, updateReaction
} from '@/components/MoleculeOrder/service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import SendMoleculesForSynthesis from '../Libraries/SendMoleculesForSynthesis';
import {
  colorSchemeADME,
  colorStatus,
  isSystemAdmin,
  popupPositionValue
} from '@/utils/helpers';
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import MoleculeStructureActions from '@/ui/MoleculeStructureActions';
import {
  addMoleculeToCart, getMoleculeCart,
  updateMoleculeStatus,
} from '@/components/Libraries/service'
import PathwayImage from '../PathwayImage/PathwayImage';
import PathwayAction from "@/components/PathwayImage/PathwayAction";
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { DataGridTypes } from 'devextreme-react/cjs/data-grid';
import ReactionDetails from './ReactionDetails';
import Tabs from '@/ui/Tab/Tabs';
import ConfirmationDialog from './ConfirmationDialog';
import { COMPOUND_TYPE_R, DELAY } from "@/utils/constants";
import { delay } from "@/utils/helpers";
import dxCheckBox, { ValueChangedEvent } from 'devextreme/ui/check_box';
import StatusCard from '@/ui/StatusCard';
import { PathwayData } from '@/public/data/pathway2';
// import io from 'socket.io-client';

export type EditorPreparingEventEx<TRowData = any, TKey = any> =
  EditorPreparingEvent<TRowData, TKey> & {
    command?: string;
    type?: string;
  }

interface ColumnConfig<T> {
  dataField: keyof T;
  title?: string | React.ReactNode;
  width?: number;
  minWidth?: number;
  allowHeaderFiltering: boolean,
  allowSorting?: boolean,
  customRender?: (data: T) => React.ReactNode;
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

interface SolventTemperatureResponse {
  solvent: string;
  temperature: string;
}

// type ReactionsData = Reaction[];
type SolventList = string[];
type TemperatureList = number[];
type PathwayJsonType = {
  pathIndex: number,
  pathConfidence: number,
  moleculeId: number,
  description: string,
  reactions: ReactionJsonType[],
}

type ReactionMoleculeType = {
  reagentSMILES: string,
  molID: number,
  reagentName: string,
  index: number,
  inventoryID: number,
  reactionPart: string,
  molarRatio: number,
  dispenseTime: number,
}

type ReactionNameType = {
  label: string,
}

type ConditionType = {
  temperature: string,
  solvent: string,
}

type ReactionJsonType = {
  rxnTemplate: string,
  nameRXN: ReactionNameType,
  rxnindex: number,
  Confidence: number,
  conditions: ConditionType,
  productSMILES: string,
  product_type: string,
  reaction_compound: ReactionMoleculeType,
  molecules: ReactionMoleculeType[],
  rxnTemplateGroup: string,
  rxnSMILES: string,
}

const isSelectable = [MoleculeStatusCode.InRetroQueue, MoleculeStatusCode.Ready];

const MoleculeOrderPage = ({ userData }: { userData: UserData }) => {
  const { organization_id, orgUser, myRoles } = userData;
  const { type } = orgUser;
  const [loader, setLoader] = useState(false);
  const [moleculeOrderData, setMoleculeOrderData] = useState<MoleculeOrder[]>([]);
  const [synthesisView, setSynthesisView] = useState(false);
  const [pathwayView, setPathwayView] = useState(false);
  const [nodeValue, setNodes] = useState<NodeType[][]>([]);
  const [synthesisPopupPos, setSynthesisPopupPosition] = useState<any>({});
  const [isMoleculeInCart, setCartMolecule] = useState<number[]>([]); // Store selected item IDs
  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs
  const [reactions, setReactions] = useState(-1);
  const [moleculeData, setMoleculeData] = useState<MoleculeOrder[]>([]);
  const [inRetroData, setToIntroQueue] = useState<MoleculeOrder[]>([]);
  // const [pathwayDataLocal, setPathwayData] = useState<Reaction[]>([]);
  // const [socket, setSocket] = useState(null);
  // const [message, setMessage] = useState(null);
  // const [connected, setConnected] = useState(false);

  const context: any = useContext(AppContext);
  const appContext = context.state;
  const [reactionsData, setReactionsData] = useState<any[]>([]);
  const [solventList, setSolventList] = useState<SolventList>([]);
  const [temperatureList, setTemperatureList] = useState<TemperatureList>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeReaction, setActiveReaction] = useState<number>(0);
  const [nextReaction, setNextReaction] = useState<boolean>(false);
  const [moleculeCompound, setMoleculeCompound] = useState<any[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [reactionDetail, setReactionDetail] = useState<ReactionDetail>();
  const [confirm, setConfirm] = useState(false);
  const [selectedMoleculeId, setSelecterdMoleculeId] = useState<number>();
  const [selecteLabJobOrder, setSelecteLabJobOrder] = useState<CreateLabJobOrder[]>([]);
  const selectionRef = useRef<{
    checkBoxUpdating: boolean,
    selectAllCheckBox: dxCheckBox | null
  }>({
    checkBoxUpdating: false,
    selectAllCheckBox: null
  });

  const breadcrumbs: BreadCrumbsObj[] = [
    { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
    {
      label: 'Molecule Orders', svgPath: '/icons/molecule-order.svg',
      svgWidth: 16, svgHeight: 16, href: '/projects', isActive: true
    },
  ];

  const columns: ColumnConfig<MoleculeOrder>[] = [
    {
      dataField: 'smiles_string',
      title: 'Structure',
      minWidth: 400,
      width: 400,
      allowHeaderFiltering: true,
      allowSorting: true,
      customRender: (data) => (
        <MoleculeStructureActions
          smilesString={data.smiles_string}
          molecule_id={data.id}
          onZoomClick={() => handleStructureZoom()}
        />
      ),
    },
    {
      dataField: 'organizationName', title: 'Customer',
      allowHeaderFiltering: true, allowSorting: true
    },
    {
      dataField: 'order_id', title: 'Order',
      allowHeaderFiltering: true, allowSorting: true,
    },
    {
      dataField: 'molecule_id', title: 'Molecule ID',
      allowHeaderFiltering: true, allowSorting: true,
      customRender: (data) => (
        data.status === MoleculeStatusCode.Ready ?
          <button onClick={() => {
            setPath(data);
            setActiveTab(0);
          }}
            className="text-themeBlueColor underline">
            {data.molecule_id}</button> :
          <p>{data.molecule_id}</p>
      )
    },
    {
      dataField: 'molecular_weight', title: 'Molecular Weight',
      allowHeaderFiltering: true, allowSorting: true
    },
    {
      dataField: 'status',
      title: 'Status',
      width: 170,
      allowHeaderFiltering: true,
      allowSorting: true,
      customRender: (data: MoleculeOrder) => {
        const status: any = colorStatus(data.status);
        return (
          <StatusCard key={data.molecule_id} stat={status} />
        );
      }
    },
    {
      dataField: 'yield', title: 'Yield', width: 100,
      allowHeaderFiltering: true, allowSorting: true
    },
    {
      dataField: 'anlayse', title: 'Analyse', width: 100,
      allowHeaderFiltering: true, allowSorting: true
    },
    {
      dataField: 'herg', title: 'HERG', width: 100,
      allowHeaderFiltering: true, allowSorting: true
    },
    {
      dataField: 'caco2', title: 'Caco-2', width: 100,
      allowHeaderFiltering: true, allowSorting: true
    },
  ];

  // useEffect(() => {
  //   // const socket = io(process.env.NEXT_PUBLIC_WEB_SOCKET_URL);
  //   // const socket = i
  // o('https://it8h43bqkj.execute-api.us-east-1.amazonaws.com/Dev/@connections', {
  //   //   path: '/socket.io' // This is the default path for Socket.IO
  //   // });
  //   // const socket = 
  // io('https://it8h43bqkj.execute-api.us-east-1.amazonaws.com/Dev/@connections')

  //   const socket = io(
  // 'https://it8h43bqkj.execute-api.us-east-1.amazonaws.com/Dev/@connections', {
  //     transports: ['websocket'], // Optional: specify transport method
  //     path: '/socket.io' // Ensure the correct path for Socket.IO
  //   });


  //   socket.on('connect', () => {
  //     console.log('Connected to WebSocket server');
  //   });

  //   socket.on('response', (data) => {
  //     console.log('Response from server:', data);
  //     // setResponse(data);
  //   });

  //   setSocket(socket);

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);


  // useEffect(() => {
  //   const socket = new WebSocket(
  // 'https://it8h43bqkj.execute-api.us-east-1.amazonaws.com/Dev/@connections');

  //   socket.onopen = () => {
  //     console.log("WebSocket connection established");
  //     setConnected(true);
  //   };

  //   socket.onmessage = (event) => {
  //     console.log("Message received: ", event.data);
  //     setMessage(event.data);
  //   };

  //   socket.onclose = () => {
  //     console.log("WebSocket connection closed");
  //     setConnected(false);
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  const rowGroupName = () => {
    if (type === OrganizationType.External) {
      return "project / library";
    } else if (type === OrganizationType.Internal) {
      return "organization / order";
    }
  }
  const prepareLabOrderData = (data: MoleculeOrder) => {
    const { molecule_id, id, library_id, project_id, organization_id } = data || {};
    const selectedMolecule: MoleculeLabJob[] = [{
      id: id,
      molecule_id: molecule_id,
      order_id: id,
      library_id: library_id,
      project_id: project_id,
      organization_id: organization_id,
      user_id: userData.id
    }];
    setSelecteLabJobOrder(selectedMolecule)
  }
  const setPath = async (data: MoleculeOrder) => {
    prepareLabOrderData(data)
    if (data) {
      setSelecterdMoleculeId(data.molecule_id);
      const pathways = await getReactionPathway(data.molecule_id);
      // setPathwayData(pathways?.data);
      let compounds: ReactionCompoundType[] = [];
      const flattenedPathways = pathways?.data?.map((pathway: PathwayType) => {
        // Create an array to hold the nodes
        const nodes: NodeType[] = [];
        // Create a reaction node for each pathway's reaction detail

        pathway.reaction_detail.reverse().map((reaction: ReactionDetailType, index: number) => {
          let conditions = '';
          if (reaction.temperature) {
            conditions += `${reaction.temperature}°C`;
          }
          if (reaction.solvent) {
            conditions += reaction.temperature ? ', ' : '';
            conditions += `${reaction.solvent}`;
          }
          const idx = pathway.reaction_detail.length - index;
          const reactionNode: NodeType = {
            id: reaction.id, // Ensure the ID is a string
            type: "molecule",
            name: reaction.reaction_name,
            smiles: reaction.product_smiles_string,
            condition: conditions,
            reactionIndex: idx,
          };
          // Push the reaction node
          if (reaction.product_type === 'F') {
            nodes.push(reactionNode);
          } else {
            const molecule = compounds.find(compound =>
              compound.smiles_string === reaction.product_smiles_string);
            compounds = [];
            if (molecule) {
              reactionNode.id = molecule.id.toString();
            }
          }

          // Add the pathway itself as a molecule node
          const pathwayNode: NodeType = {
            id: reaction.product_type === 'F' ? pathway.id : reaction.id,
            parentId: reactionNode.id?.toString(),
            type: "reaction",
            name: reactionNode.name,
            condition: reactionNode.condition,
            reactionIndex: idx,
          };

          nodes.push(pathwayNode);

          // Create molecule nodes for each reaction compound
          reaction.reaction_compound.forEach((compound: ReactionCompoundType) => {
            compounds.push(compound);
            if (compound.compound_type === 'R') {
              const compoundNode = {
                id: compound.id.toString(), // Ensure the ID is a string
                parentId: pathwayNode.id, // Parent is the reaction
                type: "molecule",
                smiles: compound.smiles_string,
                reactionIndex: idx,
                score: null, // Score is not defined for molecules in the provided format
              };
              nodes.push(compoundNode);
            }
          });
        });

        return nodes; // Return all nodes for the current pathway
      });
      setNodes(flattenedPathways);
      showOverlay(15000);
      showPathway();
    }
  }
  const createLabJobOrder = () => {
    const moleculeData: CreateLabJobOrder[] = selecteLabJobOrder;
    context?.addToState({
      ...appContext, cartDetail: [...moleculeData]
    })
    addMoleculeToCart(moleculeData)
      .then((res) => {
        if (res) {
          setPathwayView(false);
          setReactions(-1);
          toast.success(Messages.CREATE_LAB_JOB_ORDER, {
            position: 'top-center'
          });
        }
      })
      .catch((error) => {
        toast.success(error);
      })
  }

  const fetchMoleculeOrders = async () => {
    let data = [];
    let transformedData: any[] = [];
    setLoader(true);
    try {
      if (type === OrganizationType.External) {
        // External users: fetch records filtered by organization_id
        let params: MoleculeOrderParams = {
          organization_id: organization_id
        };
        if (isSystemAdmin(myRoles) || myRoles.includes('library_manager')) {
          params = {
            ...params,
            created_by: userData.id
          }
        }
        data = await getMoleculesOrder(params);
      } else if (type === OrganizationType.Internal) {
        // Internal users: fetch all records without filters
        data = await getMoleculesOrder({});
      } else {
        toast.error(Messages.USER_ROLE_CHECK);
      }
      if (!data.error) {
        const cartDataAvaialable: any = await getMoleculeCart(Number(userData.id));
        const moleculeIds = cartDataAvaialable.map((item: any) => item.molecule_id);
        const selectedMoleculeInCart = data
          .filter((item: any) => moleculeIds.includes(item.molecule_id))
          .map((item: any) => item.id);
        setCartMolecule(selectedMoleculeInCart)
        // Transform the fetched data if data is available
        transformedData = data?.map((item: any) => {
          const {
            molecule,
            organization,
            order_name,
            project,
            library,
            ...rest
          } = item;

          return {
            ...rest,
            organizationName: organization?.name || 'Unknown',
            molecular_weight: molecule?.molecular_weight || 0,
            smiles_string: molecule?.smiles_string || '',
            status: molecule?.status || 'Unknown',
            order_name,
            ...(() => {
              if (type === OrganizationType.External) {
                return {
                  "project / library": `${project.name || 'Unknown'} / ${library.name || 'Unknown'}`
                }
              } else if (type === OrganizationType.Internal) {
                return {
                  "organization / order":
                    `${organization.name || 'Unknown'} / ${order_name || 'Unknown'}`
                }
              }
            })()
          };
        });

        setMoleculeOrderData(transformedData);
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

  const handleStructureZoom = () => { };

  useEffect(() => {
    fetchMoleculeOrders();
    setSynthesisPopupPosition(popupPositionValue());
  }, [])

  const handleSendForSynthesis = () => {
    setSynthesisView(true);
  };

  const setStatus = (moleculeArray: MoleculeOrder[], value: number) => {
    const newMolecules = moleculeOrderData.map((molecule: MoleculeOrder) => {
      if (moleculeArray.some(mol => mol.molecule_id === molecule.molecule_id)) {
        return { ...molecule, status: value };
      }
      return molecule;
    });
    setMoleculeOrderData(newMolecules);
  }

  const prePareMolecule = (moleculeData: ReactionMoleculeType[]) => {
    const moleculeInsert = moleculeData.map((item: ReactionMoleculeType, index: number) => ({
      smiles_string: item.reagentSMILES,
      compound_id: item.molID,
      // reaction_id: index,
      compound_type: item.reactionPart.charAt(0).toUpperCase(),
      compound_name: item.reagentName,
      compound_sequence_no: index,
      source: 'IN',
      inventory_id: item.inventoryID,
      created_by: userData.id,
      molar_ratio: item.molarRatio,
      dispense_time: Number(item.dispenseTime),
    }));
    return moleculeInsert;
  }

  const prepareReaction = (reaction: ReactionJsonType[]) => {
    const reactionInsert = reaction.map((item: ReactionJsonType, index) => ({
      reaction_template: item.rxnTemplate || '',
      reaction_name: item.nameRXN.label,
      pathway_instance_id: 0,
      reaction_sequence_no: item.rxnindex,
      confidence: item.Confidence || null,
      temperature: item.conditions.temperature,
      solvent: item.conditions.solvent,
      product_smiles_string: item.productSMILES,
      reaction_smiles_string: item.rxnSMILES,
      product_type: index === reaction.length - 1 ? "F" : "I",
      status: 1,
      created_by: userData.id,
      reaction_compound: prePareMolecule(item.molecules),
    }));
    return reactionInsert;
  }

  const extractJsonData = async (data: any, molecules: MoleculeOrder[]) => {
    const synthesisData: PathwayType[] = [];
    molecules.map(mol => {
      const pathwayData = data.target.pathways.map((pathway: PathwayJsonType) => ({
        molecule_id: mol.molecule_id,  //data.target.targetID,
        pathway_instance_id: 0,
        pathway_index: pathway.pathIndex,
        pathway_score: pathway.pathConfidence,
        description: pathway.description,
        selected: false,
        created_by: userData.id,

        reaction_detail: prepareReaction(pathway.reactions)
      }));
      synthesisData.push(...pathwayData);
    });

    try {
      setLoader(false);
      await saveReactionPathway(synthesisData);
    } catch (err) {
      if (err) {
        await updateMoleculeStatus(moleculeData, MoleculeStatusCode.Ready, userData.id);
        setStatus(moleculeData, MoleculeStatusCode.Ready);
      }
    }

    // setToIntroQueue(transformedData.filter(molecule => 
    // !isSelectable.includes(molecule.status)))
    // const response = await saveReactionPathway(pathways);
    // if (response.error) {
    //   const toastId = toast.error(`${response.error}`);
    //   await delay(DELAY);
    //   toast.remove(toastId);
    // }
  }

  const showOverlay = (timeOut: number) => {
    setIsOverlayVisible(true);
    setTimeout(() => {
      setIsOverlayVisible(false);
    }, timeOut);
  }

  const generateReactionPathway = async () => {
    // const tempData = [...moleculeData];
    // const data = [...inRetroData, ...moleculeData];
    setLoader(true);
    const toastId = toast(Messages.sentForSynthesis(moleculeData.length), {
      icon: 'ℹ️',
      style: {
        background: '#FFC832',
      }
    });
    await delay(DELAY);
    toast.remove(toastId);
    setStatus(moleculeData, MoleculeStatusCode.InRetroQueue);
    setToIntroQueue(moleculeData);
    await updateMoleculeStatus(moleculeData, MoleculeStatusCode.InRetroQueue, userData.id);
    setSelectedRows([]);
    setIsAddToCartEnabled(true);
    extractJsonData(PathwayData, moleculeData);
    setMoleculeData([]);

    //needed for api
    // const groupedOrder = moleculeData.reduce((
    //   acc: Map<number, MoleculeOrder[]>, molecule: MoleculeOrder) => {
    //   const key = molecule.order_id; // Use the appropriate key for grouping
    //   if (!acc.has(key)) {
    //     acc.set(key, []);
    //   }
    //   acc.get(key)!.push(molecule);
    //   return acc;
    // }, new Map<number, MoleculeOrder[]>());

    // const formData = {
    //   submittedBy: userData.id,
    //   submittedAt: new Date().toISOString(),
    //   submittedMolecules: Array.from(groupedOrder.entries()).map(([key, value]) => {
    //     return {
    //       orderId: key.toString(),
    //       molecules: value.map(molecule => ({
    //         id: molecule.molecule_id.toString(),
    //         smile: molecule.smiles_string,
    //       }))
    //     }
    //   })
    // }

    // const response = await generatePathway(formData);
    // console.log('aqaqa', response)
    // if (response.status === 200) {
    //   await updateMoleculeStatus(moleculeData, MoleculeStatusCode.InRetroQueue, userData.id);
    //   setStatus(tempData, MoleculeStatusCode.InRetroQueue);
    //   // if (socket) {
    //   //   socket.emit('sent-for-synthesis', response.message_id);
    //   // }
    // } else {
    //   if (!response) {
    //     extractJsonData(PathwayData);
    //     await updateMoleculeStatus(moleculeData, MoleculeStatusCode.InRetroQueue, userData.id);
    //   }
    // await updateMoleculeStatus(moleculeData, MoleculeStatusCode.Failed, userData.id);
    // setStatus(tempData, MoleculeStatusCode.Failed);
    // }
  }

  const handleAddtoCart = () => {
    context?.addToState({
      ...appContext, cartDetail: [...moleculeData]
    });
    addMoleculeToCart(moleculeData as any)
      .then((res) => {
        toast.success(Messages.addMoleculeCartMessage(res.count));
      })
      .catch((error) => {
        toast.success(error);
      })
  };

  const onEditorPreparing = useCallback((e: EditorPreparingEventEx<MoleculeOrder, number>) => {
    const dataGrid = e.component;
    if (e.type !== 'selection') return;
    if (e.parentType === 'dataRow' && e.row && isSelectable.includes(e.row.data.status))
      e.editorOptions.disabled = true;
    if (e.parentType === "headerRow") {
      e.editorOptions.onInitialized = (e: ValueChangedEvent) => {
        if (e.component)
          selectionRef.current.selectAllCheckBox = e.component;
      };
      e.editorOptions.value = isSelectAll(dataGrid);
      e.editorOptions.onValueChanged = (e: ValueChangedEvent) => {
        if (!e.event) {
          if (e.previousValue && selectionRef.current.checkBoxUpdating)
            e.component.option("value", e.previousValue);
          return;
        }
        if (isSelectAll(dataGrid) === e.value)
          return;
        if (e.value) {
          dataGrid.selectAll();
        } else {
          dataGrid.deselectAll();
        }
        e.event.preventDefault();
      }
    }

  }, [])

  function isSelectAll(dataGrid: dxDataGrid<MoleculeOrder, number>) {
    let items: MoleculeOrder[] = [];
    dataGrid.getDataSource().store().load().then((data) => {
      items = data as MoleculeOrder[];
    });
    const selectableItems = items.filter(val => !isSelectable.includes(val.status));
    const selectedRowKeys = dataGrid.option("selectedRowKeys");
    if (!selectedRowKeys || !selectedRowKeys.length) {
      return false;
    }
    return selectedRowKeys.length >= selectableItems.length ? true : undefined;
  }

  const onSelectionChanged = async (e: SelectionChangedEvent) => {
    // disable selecting certain rows
    const deselectRowKeys: number[] = [];
    e.selectedRowsData.forEach((item) => {
      if (isSelectable.includes(item.status)) {
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
      setIsAddToCartEnabled(false)
    }
    else {
      setIsAddToCartEnabled(true)
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
  }

  const showPathway = () => {
    setPathwayView(true);
    showOverlay(15000);
  }

  const toolbarButtons = [
    {
      text: `Send for Retrosynthesis (${moleculeData.length})`, onClick: handleSendForSynthesis,
      disabled: isAddToCartEnabled,
      class: isAddToCartEnabled ? 'mol-ord-btn-disable' : 'btn-primary'
    },
    { text: "Add to Cart", onClick: handleAddtoCart, disabled: isAddToCartEnabled, visible: false },
  ];

  const fieldNames: string[] = ["yield", "anlayse", "herg", "caco2"];

  const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {
    if (e.rowType === "data") {
      if (e.column.dataField === "status") {
        const status: any = colorStatus(e.data.status);
        e.cellElement.classList.add(status?.background);
      } else if (e?.column?.dataField && fieldNames.includes(e.column.dataField)) {
        const value = e.data?.[e.column.dataField];
        if (value !== undefined) {
          const color = colorSchemeADME(value);
          e.cellElement.classList.add(color);
        }
      }
    }

    // Handling cart molecules
    if (isMoleculeInCart.includes(e.key)) {
      e.cellElement.style.pointerEvents = 'none';
      e.cellElement.style.opacity = '0.5';
    }
  };


  // Fetch Reaction Data
  const fetchData = async (idx: number) => {
    try {
      const pathwayReactionData = await getReactionPathway(Number(selectedMoleculeId), idx);
      if (pathwayReactionData.data[0]) {
        const modifiedReactionData: Reaction[] = pathwayReactionData.data[0].reaction_detail || [];
        // Create a shallow copy and reverse it
        setReactionsData(modifiedReactionData || []);
        setReactions(idx);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (reactionDetail?.reactionTemplate) {
      fetchSolventTemperatureList(reactionDetail.reactionTemplate)
    }
  }, [reactionDetail])

  // Fetch Solvent and Temperature List
  const fetchSolventTemperatureList = async (reactionTemplate: string) => {
    try {
      const response: SolventTemperatureResponse | null =
        await getSolventTemperature(reactionTemplate);
      setSolventList(response?.solvent?.split(',').map((s: string) => s.trim()) || []);
      setTemperatureList(response?.temperature?.split(',').map((t: string) =>
        Number(t.trim())) || []);
    } catch (error) {
      console.error('Error fetching solvent/temperature list:', error);
    }
  };

  // Save Reaction Changes
  const handleSaveReaction = async () => {
    const { id, temperature, solvent } = reactionDetail || {};
    setDisabled(true);
    setConfirm(false);

    const payload = {
      data: {
        id: id,
        temperature: Number(temperature),
        solvent: solvent,
      },
      molecules: moleculeCompound,
    };
    const response = await updateReaction(payload);

    if (response) {
      setMoleculeCompound([]);
      if (nextReaction && activeReaction < tabsDetails?.length - 1) {
        setActiveTab(activeTab + 1);
        setActiveReaction(activeReaction + 1);
      } else if (activeReaction < tabsDetails?.length - 1) {
        if (activeReaction === activeTab) {
          setActiveReaction(activeReaction);
        }
      }
      setDisabled(false);
      toast.success(Messages.MOLECULES_SAVE_MSG);

    }
  };

  const handleDataChange = (input: ReactionInputData[]) => {
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

  const handleSolventChange = (solvent: string) => {
    setReactionDetail((prevState) => {
      // Ensure prevState is not undefined before spreading
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

  const consolidatedReagents: Compound[] = reactionsData?.flatMap((reaction) =>
    reaction.reaction_compound.filter((compound: Compound) =>
      compound.compound_type === COMPOUND_TYPE_R)
  );

  const tabsDetails: TabDetail[] = [
    ...reactionsData.map((reaction, index) => ({
      title: `Reaction ${index + 1}`,
      Component: ReactionDetails,
      props: {
        isReactantList: false,
        data: reaction,
        onDataChange: handleDataChange,
        solventList,
        temperatureList,
        onSolventChange: handleSolventChange,
        onTemperatureChange: handleTemperatureChange,
        setReactionDetail: setReactionDetail
      },
    })),
    {
      title: 'Reactant List',
      Component: ReactionDetails,
      props: {
        isReactantList: true,
        data: consolidatedReagents,
      },
    },
  ];

  const handleNextReaction = (Checked: boolean) => {
    setNextReaction(Checked);
  };

  const handleOpenClick = async (index: number) => {
    await fetchData(index);
  };

  return (
    <div className="flex flex-col">
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="pt-[10px]">
        <main className="main main-title pl-[20px]">
          <Image src="/icons/molecule-order.svg" width={33} height={30} alt="Project logo" />
          <span>Molecule Orders</span>
        </main>
        <div className="p-[20px]">
          <CustomDataGrid
            columns={columns}
            data={moleculeOrderData}
            groupingColumn={rowGroupName()}
            enableRowSelection
            enableGrouping
            enableInfiniteScroll={false}
            enableSorting
            enableFiltering={false}
            enableOptions={false}
            toolbarButtons={toolbarButtons}
            loader={loader}
            enableHeaderFiltering
            enableSearchOption
            selectedRowKeys={selectedRows}
            onSelectionChanged={onSelectionChanged}
            onCellPrepared={onCellPrepared}
            onEditorPreparing={onEditorPreparing}
          />
        </div>

        {synthesisView &&
          <Popup
            title='Send Molecules for Retrosynthesis?'
            visible={synthesisView}
            contentRender={() => (
              <SendMoleculesForSynthesis
                moleculeData={moleculeData}
                generateReactionPathway={generateReactionPathway}
                setSynthesisView={setSynthesisView}
                inRetroData={inRetroData}
              />
            )}
            width={700}
            hideOnOutsideClick={true}
            height="100%"
            position={synthesisPopupPos}
            onHiding={() => {
              setSynthesisView(false);
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
                <div>
                  {reactions !== -1 &&
                    <div className="flex justify-end">
                      <Button
                        className="btn-secondary"
                        text="Pathway List"
                        icon="/icons/back-icon.svg"
                        onClick={() =>
                          setReactions(-1)
                        }
                      />
                    </div>
                  }
                  {nodeValue?.length > 0 && (
                    <div style={{
                      // Hide if overlay is visible or no filtered data
                      display: isOverlayVisible
                        ? 'none' : 'block',
                    }}>{
                        nodeValue.map((node, idx) => {
                          if (reactions === -1 || reactions === idx) {
                            return (
                              <div key={`node-${idx}`} className="mt-[10px] mb-[10px]">
                                <div style={{ textAlign: 'right', padding: '10px' }}
                                  className="bg-white">
                                  {reactions === -1 &&
                                    <button className="primary-button"
                                      onClick={() => handleOpenClick(idx)}>
                                      Open
                                    </button>}
                                </div>
                                <PathwayImage pathwayId={`node-${idx}`} nodes={node}
                                  style={{ position: 'relative' }} width={800} height={300}>
                                  <PathwayAction pathwayId={`node-${idx}`} />
                                </PathwayImage>
                                {reactions === idx && (
                                  <div className="border border-[var(--themeSecondaryGreyColor)] 
                        bg-white shadow-[0px_-3px_1px_rgb(190_185_185_/_90%)] pb-[38px]">
                                    <Tabs tabsDetails={tabsDetails} activeTab={activeTab}
                                      onSelectedIndexChange={(tabIndex: number) =>
                                        setActiveTab(tabIndex)}
                                    />
                                    {/* Bottom Fixed Section */}
                                    <div className={`fixed bottom-0 left-0 right-0 
                                    bg-themelightGreyColor py-[16px] pr-[40px] pl-[24px]
                                    border-t flex justify-between`}>
                                      <div className="flex items-center gap-4">
                                        <Button disabled={activeTab === tabsDetails.length - 1
                                          || disabled}
                                          text="Save"
                                          onClick={() => setConfirm(true)}
                                          className="btn-primary"
                                        />
                                        <Button disabled={activeTab === tabsDetails.length - 1}
                                          text="Cancel"
                                          onClick={() => {
                                            setReactions(-1);
                                            setActiveTab(0);
                                            setActiveReaction(0);
                                            setNextReaction(false);
                                          }
                                          }
                                          className="btn-secondary border-0 border-none"
                                        />
                                        <label className="flex items-center">
                                          <CheckBox disabled={activeTab === tabsDetails.length - 1}
                                            defaultValue={nextReaction}
                                            elementAttr={{ 'aria-label': 'Next Reaction' }}
                                            onValueChanged={(e) => handleNextReaction(e.value)}
                                            className={nextReaction ? 'bg-themeBlueColor'
                                              : 'bg-white'}
                                          />
                                          <span className="ml-2 text-themeBlueColor">
                                            Next Reaction
                                          </span>
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        {[...Array(tabsDetails?.length - 1)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-8 h-8 rounded-full flex items-center 
                                              justify-center 
                                              ${activeReaction > i
                                                ? 'bg-lightGrey text-white'
                                                : i % 3 === 0
                                                  ? 'bg-lightMerun text-white'
                                                  : i % 3 === 1
                                                    ? 'bg-lightBlue text-white'
                                                    : 'bg-lightGrey text-white'
                                              }`}
                                          >
                                            {activeReaction > i ? <Image src="icons/tick-mark.svg"
                                              alt="tick-mark" height={25} width={25} /> : i + 1}
                                          </div>
                                        ))}
                                        {/* on last tab this will be 'L' active  */}
                                        {<div className='w-8 h-8 rounded-full flex items-center 
                              justify-center border bg-lightGrey text-white'>
                                          L
                                        </div>}
                                      </div>
                                      <Button
                                        className='btn-primary'
                                        disabled={activeTab !== tabsDetails.length - 1 || disabled}
                                        onClick={createLabJobOrder}
                                      >
                                        Send For Lab Job
                                      </Button>
                                    </div>
                                    {/* ConfirmationDialog with onSave handler */}
                                    <ConfirmationDialog
                                      onSave={handleSaveReaction}
                                      openConfirmation={confirm}
                                      setConfirm={setConfirm}
                                    />
                                  </div>)}
                              </div>
                            )
                          }
                        })}
                    </div>
                  )}

                </div>

                {isOverlayVisible && (
                  <div className="overlay">
                    <div className="overlay-content">
                      <LoadIndicator />
                    </div>
                  </div>
                )}

              </div>
            )}
            width={800}
            hideOnOutsideClick={true}
            height="100%"
            position={synthesisPopupPos}
            onHiding={() => {
              setPathwayView(false);
              setReactions(-1);
            }}
            showCloseButton={true}
            wrapperAttr={
              {
                class: "pathway-popup"
              }
            }
          />
        }
        <div className='flex justify-center mt-[25px]'>
          <span className='text-themeGreyColor'>
            {moleculeOrderData.length}
            <span className='pl-[3px]'>
              {moleculeOrderData.length === 1 ? 'molecule' : 'molecules'}
            </span>
            <span className='pl-[2px]'> found</span>
          </span>
          {!!moleculeOrderData.length && <span>&nbsp;|&nbsp;</span>}
          {!!moleculeOrderData.length &&
            <span className={`text-themeSecondayBlue pl-[5px] font-bold pb-[10px]`}>
              Select All {moleculeOrderData.length}
            </span>}
        </div>
      </div>
    </div>
  );

};

export default MoleculeOrderPage;