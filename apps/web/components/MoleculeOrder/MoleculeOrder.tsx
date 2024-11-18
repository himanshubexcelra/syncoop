/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import React, { useEffect, useState } from 'react';
import CustomDataGrid from '@/ui/dataGrid';
import {
  BreadCrumbsObj,
  MoleculeOrder,
  MoleculeOrderParams,
  OrganizationType,
  UserData,
  MoleculeType,
  StatusTypes,
} from '@/lib/definition';
import Image from 'next/image';
import {
  StatusCodeBg,
  StatusCodeTextColor,
} from '@/utils/constants';
import { Popup } from 'devextreme-react';
import StatusMark from '@/ui/StatusMark';
import { getMoleculesOrder } from '@/components/MoleculeOrder/service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import SendMoleculesForSynthesis from '../Libraries/SendMoleculesForSynthesis';
import {
  colorSchemeADME,
  generateRandomDigitNumber,
  getStatusLabel,
  isAdmin,
  popupPositionValue
} from '@/utils/helpers';
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import MoleculeStructureActions from '@/ui/MoleculeStructureActions';
import { addMoleculeToCart, getMoleculeCart } from '@/components/Libraries/libraryService'
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import { DataGridTypes } from 'devextreme-react/cjs/data-grid';

interface ColumnConfig<T> {
  dataField: keyof T;
  title?: string | React.ReactNode;
  width?: number;
  minWidth?: number;
  allowHeaderFiltering: boolean,
  allowSorting?: boolean,
  customRender?: (data: T) => React.ReactNode;
}

const MoleculeOrderPage = ({ userData }: { userData: UserData }) => {
  const { organization_id, orgUser, myRoles } = userData;
  const { type } = orgUser;
  const [loader, setLoader] = useState(false);
  const [moleculeOrderData, setMoleculeOrderData] = useState<MoleculeOrder[]>([]);
  const [synthesisView, setSynthesisView] = useState(false);
  const [synthesisPopupPos, setSynthesisPopupPosition] = useState<any>({});
  const [isMoleculeInCart, setCartMolecule] = useState<number[]>([]); // Store selected item IDs
  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs

  const [moleculeData, setMoleculeData] = useState<MoleculeType[]>([]);

  const context: any = useContext(AppContext);
  const appContext = context.state;

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
      dataField: 'order_id', title: 'Order',
      allowHeaderFiltering: true, allowSorting: true
    },
    {
      dataField: 'molecule_id', title: 'Molecule ID',
      allowHeaderFiltering: true, allowSorting: true
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
      customRender: (data) => {
        const statusUpper = getStatusLabel(data.status);
        const colorKey = statusUpper.toUpperCase() as keyof typeof StatusCodeBg;
        const colorBgClass = StatusCodeBg[colorKey] || "bg-white";
        const textColorClass = StatusCodeTextColor[colorKey] || "#000";
        return (
          <div className={`flex items-center gap-[5px] ${colorBgClass} ${textColorClass}`}>
            {colorKey === StatusTypes.Failed && (
              <Image src="/icons/warning.svg" width={14}
                height={14} alt="Molecule order failed" />
            )}
            {colorKey === StatusTypes.InRetroQueue && (
              <Image src="/icons/queue.svg" width={14}
                height={14} alt="Molecule order In-retro Queue" />
            )}
            {statusUpper}
            <StatusMark status={statusUpper} />
          </div>
        );
      }
    },
    {
      dataField: 'yield', title: 'Yield', width: 100,
      allowHeaderFiltering: true, allowSorting: true,
      customRender: (data) => {
        const color = colorSchemeADME(data, 'yield')
        return (
          <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
            {`${data['yield']} || ''`}
          </span>
        )
      }
    },
    {
      dataField: 'anlayse', title: 'Analyse', width: 100,
      allowHeaderFiltering: true, allowSorting: true,
      customRender: (data) => {
        const color = colorSchemeADME(data, 'anlayse')
        return (
          <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
            {`${data['anlayse']} || ''`}
          </span>
        )
      }
    },
    {
      dataField: 'herg', title: 'HERG', width: 100,
      allowHeaderFiltering: true, allowSorting: true,
      customRender: (data) => {
        const color = colorSchemeADME(data, 'herg')
        return (
          <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
            {`${data['herg']} || ''`}
          </span>
        )
      }
    },
    {
      dataField: 'caco2', title: 'Caco-2', width: 100,
      allowHeaderFiltering: true, allowSorting: true,
      customRender: (data) => {
        const color = colorSchemeADME(data, 'caco2')
        return (
          <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
            {`${data['caco2']} || ''`}
          </span>
        )
      }
    },
  ];

  const rowGroupName = () => {
    if (type === OrganizationType.External) {
      return "project / library";
    } else if (type === OrganizationType.Internal) {
      return "organization / order";
    }
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
        if (!isAdmin(myRoles) && myRoles.includes('library_manager')) {
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

  const handleAddtoCart = () => {
    context?.addToState({
      ...appContext, cartDetail: [...moleculeData]
    })
    addMoleculeToCart(moleculeData)
      .then((res) => {
        toast.success(Messages.addMoleculeCartMessage(res.count));
      })
      .catch((error) => {
        toast.success(error);
      })

  };



  const onSelectionChanged = async (e: any) => {
    setSelectedRows(e.selectedRowKeys)
    if (e.selectedRowKeys.length > 0) {
      setIsAddToCartEnabled(false)
    }
    else {
      setIsAddToCartEnabled(true)

    }
    const orderId = generateRandomDigitNumber();
    const selectedProjectMolecule: MoleculeType[] = e.selectedRowsData.map((item: any) => ({
      ...item,
      order_id: orderId,
      molecule_id: item.molecule_id,
      library_id: item.library_id,
      user_id: userData.id,
      organization_id: item.organization_id,
      project_id: item.project_id
    }));
    setMoleculeData(selectedProjectMolecule);
  }

  const toolbarButtons = [
    { text: "Send for Synthesis", onClick: handleSendForSynthesis, disabled: false },
    { text: "Add to Cart", onClick: handleAddtoCart, disabled: isAddToCartEnabled }
  ];

  const onCellPrepared = (e: DataGridTypes.CellPreparedEvent) => {
    if (e.rowType === "data") {
      if (e.column.dataField === "status") {
        const status = getStatusLabel(e.data.status);
        e.cellElement.classList.add(status);
      }
    }
    if (isMoleculeInCart.includes(e.key)) {
      e.cellElement.style.pointerEvents = 'none';
      e.cellElement.style.opacity = '0.5';
    }
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="pt-[20px]">
        <main className="main main-title">
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
          />
        </div>

        {synthesisView &&
          <Popup
            title='Send Molecules for Retrosynthesis?'
            visible={synthesisView}
            contentRender={() => (
              <SendMoleculesForSynthesis
                moleculeData={moleculeOrderData}
              />
            )}
            width={650}
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
      </div>
    </div>
  );
};

export default MoleculeOrderPage;
