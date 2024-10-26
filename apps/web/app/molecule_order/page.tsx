'use client';

import Breadcrumb from '@/components/Breadcrumbs/BreadCrumbs';
import { BreadCrumbsObj } from '@/lib/definition';
import CustomDataGrid from '@/sharedComponents/table/dataGrid'
import { MoleculeOrders } from '@/utils/constants';
import React from 'react'

const MoleculeOrder = () => {

  const breadcrumbs: BreadCrumbsObj[] = [
    {
      label: "Home",
      svgPath: "/icons/home-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
    {
      label: "Molecule Order",
      svgPath: "/icons/molecule-order.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/projects",
    },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className='p-[20px]'>
        <CustomDataGrid
          data={MoleculeOrders}
          groupingColumn="MoleculeName"
          enableRowSelection={true}
          enableGrouping={true}
          enableInfiniteScroll={false}
          enableSorting={true}
          enableFiltering={true}
        />
      </div>
    </>
  )
}

export default MoleculeOrder