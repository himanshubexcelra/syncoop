/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/BreadCrumbs';
import CustomDataGrid from '@/sharedComponents/table/dataGrid';
import { BreadCrumbsObj } from '@/lib/definition';
import Image from 'next/image';
import { StatusCodeBg, StatusCodeType } from '@/utils/constants';
import { Button } from 'devextreme-react';
import StatusMark from '@/ui/StatusMark';
import dynamic from 'next/dynamic';

const MoleculeStructure = dynamic(
  () => import("@/utils/MoleculeStructure"),
  { ssr: false }
);

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
}

// Custom renderer function
const customRenderForField = (data: MoleculeOrder, field: string) => {
  let color: StatusCodeType = 'ready';
  const value = data[field];

  if (value !== undefined) {
    if (value <= 0.5) color = 'failed';
    else if (value > 0.5 && value < 1) color = 'info';
    else if (value >= 1) color = 'done';
  }

  return (
    <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
      {value}
    </span>
  );
};

const MoleculeOrderPage = ({ initialData }: { initialData: MoleculeOrder[] }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [moleculeOrderData, setMoleculeOrderData] = useState<MoleculeOrder[]>(initialData);

  const breadcrumbs: BreadCrumbsObj[] = [
    { label: "Home", svgPath: "/icons/home-icon.svg", svgWidth: 16, svgHeight: 16, href: "/" },
    {
      label: "Molecule Orders", svgPath: "/icons/molecule-order.svg",
      svgWidth: 16, svgHeight: 16, href: "/projects"
    },
  ];

  const handleBookMarkItem = (data: any) => console.log(data, 'data-data');
  const handleStructureEdit = (data: any) => console.log(data, 'edit');
  const handleStructureZoom = (data: any) => console.log(data, 'edit');
  const handleStructureDelete = (data: any) => console.log(data, 'edit');

  // Column configuration
  const moleculeColumns = [
    {
      dataField: 'bookmark',
      width: 100,
      title: <Image src="/icons/star.svg" width={24} height={24} alt="Bookmark" />,
      customRender: (data: MoleculeOrder) => (
        <span className='flex justify-center cursor-pointer'
          onClick={() => handleBookMarkItem(data)}>
          <Image src="/icons/star-filled.svg" width={24} height={24} alt="Bookmarked" />
        </span>
      ),
    },
    {
      dataField: 'smile',
      title: 'Structure',
      width: 240,
      customRender: (data: MoleculeOrder) => (
        <span className='flex justify-center items-center gap-[7.5px]'>
          <MoleculeStructure
            structure={data.smile}
          />
          <Button onClick={() => handleStructureZoom(data)}
            render={() => <Image src="/icons/zoom.svg" width={24} height={24} alt="zoom" />} />
          <Button onClick={() => handleStructureEdit(data)}
            render={() => <Image src="/icons/edit.svg" width={24} height={24} alt="edit" />} />
          <Button onClick={() => handleStructureDelete(data)}
            render={() => <Image src="/icons/delete.svg" width={24} height={24} alt="delete" />} />
        </span>
      ),
    },
    {
      dataField: 'orderId',
      title: 'order',
    },
    {
      dataField: 'moleculeId',
      title: 'Molecule ID',
    },
    {
      dataField: 'molecular_weight',
      title: 'Molecule Weight',
    },
    {
      dataField: 'status',
      title: 'Status',
      width: 170,
      customRender: (data: any) => (
        <span className={`flex items-center gap-[5px]
          ${StatusCodeBg[data.status?.toLowerCase()]}`}>
          {data.status}
          <StatusMark status={data.status} />
        </span>
      ),
    },
    {
      dataField: 'yield', title: 'Yield', width: 100,
      customRender: (data: MoleculeOrder) => customRenderForField(data, 'clint')
    },
    {
      dataField: 'anlayse', title: 'Analyse', width: 100,
      customRender: (data: MoleculeOrder) => customRenderForField(data, 'hepg2cytox')
    },
    {
      dataField: 'herg', title: 'HERG', width: 100,
      customRender: (data: MoleculeOrder) => customRenderForField(data, 'herg')
    },
    {
      dataField: 'caco2', title: 'Caco-2', width: 100,
      customRender: (data: MoleculeOrder) => customRenderForField(data, 'caco2')
    },

  ];

  return (
    <div className='flex flex-col'>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="p-[20px]">
        <main className="main main-title">
          <Image
            src="/icons/molecule-order.svg"
            width={33}
            height={30}
            alt="Project logo"
          />
          <span>Molecule Orders</span>
        </main>
        <CustomDataGrid
          columns={moleculeColumns}
          data={moleculeOrderData}
          groupingColumn="organizationName"
          enableRowSelection
          enableGrouping
          enableInfiniteScroll={false}
          enableSorting
          enableFiltering={false}
          enableOptions={false}
        />
      </div>
    </div>
  );
};

export default MoleculeOrderPage;
