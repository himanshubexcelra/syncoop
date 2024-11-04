/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/BreadCrumbs';
import CustomDataGrid from '@/sharedComponents/table/dataGrid';
import {
  BreadCrumbsObj,
  MoleculeOrderParams,
  OrganizationType,
  StatusCode,
  UserData
} from '@/lib/definition';
import Image from 'next/image';
import { StatusCodeAPIType, StatusCodeBg, StatusCodeBgAPI } from '@/utils/constants';
import { Button, Popup } from 'devextreme-react';
import StatusMark from '@/ui/StatusMark';
import dynamic from 'next/dynamic';
import { getMoleculesOrder } from '@/app/molecule_order/service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import SendMoleculesForSynthesis from '../Libraries/SendMoleculesForSynthesis';
import { isAdmin, popupPositionValue } from '@/utils/helpers';

const MoleculeStructure = dynamic(() => import('@/utils/MoleculeStructure'), { ssr: false });

interface MoleculeOrder {
  id: number;
  bookmark: boolean;
  structure: string;
  orderId: number;
  orderName: string;
  moleculeId: number;
  molecularWeight: number;
  organizationName: string;
  molecular_weight: string;
  smile: string;
  status: string;
  yield?: number;
  anlayse?: number;
  herg?: number;
  caco2?: number;
}

interface ColumnConfig<T> {
  dataField: keyof T;
  title?: string | React.ReactNode;
  width?: number;
  minWidth?: number;
  customRender?: (data: T) => React.ReactNode;
}

// Custom renderer function
const customRenderForField = (data: MoleculeOrder, field: keyof MoleculeOrder) => {
  let color: StatusCodeAPIType = 'READY';
  const value = data[field]; // Dynamic field access based on the `field` parameter

  if (typeof value === 'number') {
    if (value <= 0.5) color = 'FAILED';
    else if (value > 0.5 && value < 1) color = 'INFO';
    else if (value >= 1) color = 'DONE';
  }

  return (
    <span className={`flex items-center gap-[5px] ${StatusCodeBgAPI[color]}`}>
      {value}
    </span>
  );
};

const MoleculeOrderPage = ({ userData }: { userData: UserData }) => {

  const breadcrumbs: BreadCrumbsObj[] = [
    { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
    {
      label: 'Molecule Orders', svgPath: '/icons/molecule-order.svg',
      svgWidth: 16, svgHeight: 16, href: '/projects'
    },
  ];

  const { organizationId, orgUser, myRoles } = userData;
  const { type } = orgUser;
  const [moleculeOrderData, setMoleculeOrderData] = useState<MoleculeOrder[]>([]);
  const [synthesisView, setSynthesisView] = useState(false);
  const [synthesisPopupPos, setSynthesisPopupPosition] = useState<any>({});

  const columns: ColumnConfig<MoleculeOrder>[] = [
    {
      dataField: 'smile',
      title: 'Structure',
      minWidth: 400,
      customRender: (data) => (
        <span className="flex justify-center items-center gap-[7.5px]">
          <MoleculeStructure height={80} width={80} svgMode={true}
            structure={data.smile} id={`smiles-${data.id}`} />
          <Button onClick={() => handleStructureZoom()}
            render={() => <Image src="/icons/zoom.svg" width={24} height={24} alt="zoom" />} />
          <Button onClick={() => handleStructureEdit()}
            render={() => <Image src="/icons/edit.svg" width={24} height={24} alt="edit" />} />
          <Button onClick={() => handleStructureDelete()}
            render={() => <Image src="/icons/delete.svg" width={24} height={24} alt="delete" />} />
        </span>
      ),
    },
    { dataField: 'orderId', title: 'Order' },
    { dataField: 'moleculeId', title: 'Molecule ID' },
    { dataField: 'molecular_weight', title: 'Molecular Weight' },
    {
      dataField: 'status',
      title: 'Status',
      width: 170,
      customRender: (data: MoleculeOrder) => {
        const colorKey = data.status.toUpperCase() as keyof typeof StatusCodeBg;
        const color = StatusCodeBg[colorKey] || StatusCodeBg.READY;

        return (
          <span className={`flex items-center gap-[5px] ${color}`}>
            {data.status}
            <StatusMark status={StatusCode[colorKey]} />
          </span>
        );
      },
    },
    {
      dataField: 'yield', title: 'Yield', width: 100,
      customRender: (data) => customRenderForField(data, 'yield')
    },
    {
      dataField: 'anlayse', title: 'Analyse', width: 100,
      customRender: (data) => customRenderForField(data, 'anlayse')
    },
    {
      dataField: 'herg', title: 'HERG', width: 100,
      customRender: (data) => customRenderForField(data, 'herg')
    },
    {
      dataField: 'caco2', title: 'Caco-2', width: 100,
      customRender: (data) => customRenderForField(data, 'caco2')
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

    try {
      if (type === OrganizationType.External) {
        // External users: fetch records filtered by organizationId
        let params: MoleculeOrderParams = {
          organizationId: organizationId
        };
        if (!isAdmin(myRoles) && myRoles.includes('library_manager')) {
          params = {
            ...params,
            createdBy: userData.id
          }
        }
        data = await getMoleculesOrder(params);
      } else if (type === OrganizationType.Internal) {
        // Internal users: fetch all records without filters
        data = await getMoleculesOrder({});
      } else {
        toast.error(Messages.USER_ROLE_CHECK);
      }
      console.log(data);
      // Transform the fetched data if data is available
      transformedData = data?.map((item: any) => {
        const {
          molecule,
          organization,
          orderName,
          project,
          library,
          ...rest
        } = item;

        return {
          ...rest,
          organizationName: organization.name,
          molecular_weight: molecule.molecular_weight,
          smile: molecule.smile,
          status: molecule.status,
          orderName,
          ...(() => {
            if (type === OrganizationType.External) {
              return {
                "project / library": `${project.name} / ${library.name}`
              }
            } else if (type === OrganizationType.Internal) {
              return {
                "organization / order": `${organization.name} / ${orderName}`
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
    }
  }

  const handleStructureEdit = () => { };
  const handleStructureZoom = () => { };
  const handleStructureDelete = () => { };

  useEffect(() => {
    fetchMoleculeOrders();
    setSynthesisPopupPosition(popupPositionValue());
  }, [])

  return (
    <div className="flex flex-col">
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="p-[20px]">
        <main className="main main-title">
          <Image src="/icons/molecule-order.svg" width={33} height={30} alt="Project logo" />
          <span>Molecule Orders</span>
        </main>
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
        />

        {synthesisView &&
          <Popup
            title='Send Molecules for Retrosynthesis?'
            visible={synthesisView}
            contentRender={() => (
              <SendMoleculesForSynthesis
                moleculeData={[]}
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
