
/*eslint max-len: ["error", { "code": 100 }]*/
'use client';
import { useCallback, useContext, useEffect, useState } from 'react';
import Image from "next/image";
import toast from "react-hot-toast";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { AppContext } from "../../app/AppState";
import {
    StatusCodeBg,
    StatusCodeTextColor,
} from '@/utils/constants';
import {
    ColumnConfig,
    MoleculeFavourite,
    MoleculeType,
    ProjectDataFields,
    StatusTypes,
    UserData,
    addToFavouritesProps
} from '@/lib/definition';
import {
    addToFavourites,
    getLibraryById,
    addMoleculeToCart,
    getMoleculeCart
} from './libraryService';
import { DELAY } from "@/utils/constants";
import { delay, getStatusLabel, generateRandomDigitNumber, colorSchemeADME } from "@/utils/helpers";
import StatusMark from '@/ui/StatusMark';
import { Popup } from 'devextreme-react';
import AddMolecule from '../Molecule/AddMolecule/AddMolecule';
import EditMolecule from '../Molecule/EditMolecule/EditMolecule';
import { Messages } from '@/utils/message';
import CustomDataGrid from '@/ui/dataGrid';
import MoleculeStructureActions from '@/ui/MoleculeStructureActions';

type MoleculeListType = {
    moleculeLoader: boolean,
    expanded: boolean,
    tableData: MoleculeType[],
    userData: UserData,
    setMoleculeLoader: (value: boolean) => void,
    setTableData: (value: MoleculeType[]) => void,
    actionsEnabled: string[],
    selectedLibrary: number,
    library_id: string,
    projects: ProjectDataFields,
    projectId: string,
}

export default function MoleculeList({
    moleculeLoader,
    expanded,
    tableData,
    userData,
    setMoleculeLoader,
    setTableData,
    actionsEnabled,
    selectedLibrary,
    library_id,
    projects,
    projectId
}: MoleculeListType) {
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const cartEnabled = actionsEnabled.includes('create_molecule_order');
    const [editMolecules, setEditMolecules] = useState<any[]>([]);
    const [viewAddMolecule, setViewAddMolecule] = useState(false);
    const [viewEditMolecule, setViewEditMolecule] = useState(false);
    const [selectedRowsData, setSelectedRowsData] = useState([])
    const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs
    const [isMoleculeInCart, setCartMolecule] = useState<number[]>([]); // Store selected item IDs
    const [moleculeData, setMoleculeData] = useState([]);
    const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(true);
    const [reloadMolecules, setReloadMolecules] = useState(false);

    const handleStructureZoom = () => { };

    const columns: ColumnConfig<MoleculeType>[] = [
        {
            dataField: "user_favourite_molecule",
            type: "bookmark",
            width: 60,
            alignment: "center",
            allowSorting: false,
            allowHeaderFiltering: false,
            customRender: (data) => {
                const existingFavourite =
                    data.user_favourite_molecule?.find((
                        val: MoleculeFavourite) =>
                        val.user_id === userData.id &&
                        val.molecule_id === data.id);
                return (
                    <span className={`flex
                                    justify-center
                                    cursor-pointer`}
                        onClick={() =>
                            addToFavourite({
                                data,
                                existingFavourite
                            })
                        }>
                        <Image
                            src={existingFavourite ?
                                "/icons/star-filled.svg" :
                                "/icons/star.svg"
                            }
                            width={24}
                            height={24}
                            alt="favourite"
                        />
                    </span>
                );
            }
        },
        {
            dataField: 'smiles_string',
            title: 'Structure',
            minWidth: 180,
            width: 180,
            allowSorting: false,
            allowHeaderFiltering: false,
            customRender: (data) => (
                <MoleculeStructureActions
                    smilesString={data.smiles_string}
                    molecule_id={data.id}
                    onZoomClick={() => handleStructureZoom()}
                    enableEdit={actionsEnabled.includes('edit_molecule')}
                    enableDelete={actionsEnabled.includes('delete_molecule')}
                    onEditClick={() => showEditMolecule(data)}
                />
            ),
        },
        {
            dataField: 'id', title: 'Molecule ID',
            allowHeaderFiltering: false, alignment: "center"
        },
        {
            dataField: 'source_molecule_name', title: 'Molecule Name',
            allowHeaderFiltering: false, alignment: "center"
        },
        {
            dataField: 'molecular_weight', title: 'Molecular Weight',
            alignment: "center", allowHeaderFiltering: false,
            customRender: (data) => Number(data.molecular_weight).toPrecision(2)
        },
        {
            dataField: 'status',
            title: 'Status',
            width: 120,
            customRender: (data) => {
                const statusUpper = getStatusLabel(data.status);
                const colorKey = statusUpper.toUpperCase() as keyof typeof StatusCodeBg;
                const colorBgClass = StatusCodeBg[colorKey] || "bg-white";
                const textColorClass = StatusCodeTextColor[colorKey] || "#000";
                return (
                    <div className={`flex items-center gap-[5px] 
                    ${colorBgClass} ${textColorClass}`}>
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
            dataField: 'yield', title: 'Yield', width: 100, visible: !expanded,
            allowHeaderFiltering: false, allowSorting: false,
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
            dataField: 'anlayse', title: 'Analyse', width: 100, visible: !expanded,
            allowHeaderFiltering: false, allowSorting: false,
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
            dataField: 'herg', title: 'HERG', width: 100, visible: !expanded,
            allowHeaderFiltering: false, allowSorting: false,
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
            dataField: 'caco2', title: 'Caco-2', width: 100, visible: !expanded,
            allowHeaderFiltering: false, allowSorting: false,
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

    const fetchCartData = async () => {
        const moleculeCart = library_id ?
            await getMoleculeCart(Number(userData.id), Number(library_id), Number(projects.id))
            : [];
        const molecule_ids = moleculeCart.map((item: any) => item.molecule_id);
        const molecule_idsInCart = moleculeCart
            .filter((item: any) => item.molecule.is_added_to_cart)
            .map((item: any) => item.molecule_id);
        setCartMolecule(molecule_idsInCart)
        setSelectedRows(molecule_ids)
    };


    useEffect(() => {
        fetchCartData();
    }, [library_id, userData.id, appContext]);

    const onCellPrepared = (e: any) => {
        if (isMoleculeInCart.includes(e.key)) {
            e.cellElement.style.pointerEvents = 'none';
            e.cellElement.style.opacity = 0.5;
        }
        if (e.rowType === "data") {
            if (e.column.dataField === "status") {
                const statusUpper = getStatusLabel(e.data.status);
                const color = statusUpper.toUpperCase() as keyof typeof StatusCodeBg;
                e.cellElement.classList.add(StatusCodeBg[color]);
            }
        }
    };

    const addToFavourite = async ({ data, existingFavourite }: {
        data: MoleculeType,
        existingFavourite?: MoleculeFavourite
    }) => {
        setMoleculeLoader(true);
        const dataField: addToFavouritesProps = {
            molecule_id: data.id, user_id: userData.id, favourite: true
        };
        if (existingFavourite) dataField.existingFavourite = existingFavourite;
        const response = await addToFavourites(dataField);
        if (!response.error) {
            const libraryData =
                await getLibraryById(['molecule'], data.library_id.toString());
            setMoleculeLoader(false);
            setTableData(libraryData.molecule || []);
        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
            setMoleculeLoader(false);
        }
    }

    const onSelectionChanged = async (e: any) => {
        const orderId = generateRandomDigitNumber();
        if (e.selectedRowKeys.length > 0) {
            setIsAddToCartEnabled(false)
        }
        else {
            setIsAddToCartEnabled(true)

        }
        setSelectedRows(e.selectedRowKeys);
        setSelectedRowsData(e.selectedRowsData)
        const checkedMolecule = e.selectedRowsData;
        const selectedProjectMolecule = checkedMolecule.map((item: any) => ({
            ...item,
            order_id: orderId,
            molecule_id: item.id,
            library_id: library_id,
            user_id: userData.id,
            organization_id: projects.organization_id,
            project_id: projects.id
        }));

        const moleculeCart = library_id ?
            await getMoleculeCart(Number(userData.id), Number(library_id), Number(projects.id))
            : [];
        const preselectedIds = moleculeCart.map((item: any) => item.molecule_id);
        const updatedMoleculeCart = selectedProjectMolecule.filter((item: any) =>
            !preselectedIds.includes(item.molecule_id));
        // If the check box is unchecked
        if (e.currentDeselectedRowKeys.length > 0) {
            const newmoleculeData = checkedMolecule.filter((
                item: any) => item.id !== e.currentDeselectedRowKeys[0].id
                && item.project_id !== projects.id);
            setMoleculeData(newmoleculeData);
        }
        else {
            setMoleculeData(updatedMoleculeCart);
        }
    };

    const showEditMolecule = useCallback((data?: MoleculeType) => {
        const moleculesToEdit = data ? [data] : selectedRowsData;
        setEditMolecules(moleculesToEdit);
        setViewEditMolecule(true);
    }, [selectedRowsData]);

    const addProductToCart = () => {

        context?.addToState({
            ...appContext, cartDetail: [...moleculeData]
        })
        addMoleculeToCart(moleculeData)
            .then((res) => {
                toast.success(Messages.addMoleculeCartMessage(res.count));
                setIsAddToCartEnabled(true)
            })
            .catch((error) => {
                toast.success(error);
            })
    }

    useEffect(() => {
        if (reloadMolecules) {
            (async () => {
                setEditMolecules([]);
                setSelectedRowsData([]);
                setSelectedRows([]);
                setMoleculeLoader(true);
                const libraryData =
                    await getLibraryById(['molecule'], selectedLibrary.toString());
                setMoleculeLoader(false);
                setTableData(libraryData.molecule || []);
            })();
        }
    }, [reloadMolecules])

    const callLibraryId = async () => {
        setReloadMolecules(true);
    }

    const addMolecule = () => {
        setViewAddMolecule(true)
    }

    const toolbarButtons = [
        {
            text: "Add Molecule",
            onClick: addMolecule,
            icon: '/icons/plus-white.svg',
            visible: actionsEnabled.includes('create_molecule') && !!library_id
        },
        {
            text: `Edit (${selectedRows?.length})`,
            onClick: showEditMolecule,
            class: 'btn-secondary',
            visible: actionsEnabled.includes('edit_molecule') && !!library_id
        },
        {
            text: `Add to Cart (${selectedRows?.length})`,
            onClick: addProductToCart,
            class: 'btn-secondary',
            disabled: isAddToCartEnabled,
            visible: cartEnabled && !!library_id
        }
    ];

    return (
        <>
            {moleculeLoader ?
                <LoadIndicator
                    visible={moleculeLoader}
                /> :
                <div className={
                    `table pb-[10px] ${expanded ? 'w-3/5' : 'w-full'}`}>
                    <CustomDataGrid
                        columns={columns}
                        data={tableData}
                        enableRowSelection
                        enableGrouping
                        enableInfiniteScroll={false}
                        enableSorting
                        enableFiltering={false}
                        enableOptions={false}
                        toolbarButtons={toolbarButtons}
                        loader={moleculeLoader}
                        enableHeaderFiltering
                        enableSearchOption={!expanded}
                        selectedRowKeys={selectedRows}
                        onSelectionChanged={onSelectionChanged}
                        onCellPrepared={onCellPrepared}
                    />
                    {viewAddMolecule && <Popup
                        title="Add Molecule"
                        visible={viewAddMolecule}
                        contentRender={() => (
                            <AddMolecule
                                libraryId={library_id}
                                projectId={projectId}
                                userData={userData}
                                setViewAddMolecule={setViewAddMolecule}
                                callLibraryId={callLibraryId}
                            />
                        )}
                        resizeEnabled={true}
                        hideOnOutsideClick={true}
                        defaultWidth={700}
                        defaultHeight={'100%'}
                        position={{
                            my: { x: 'right', y: 'top' },
                            at: { x: 'right', y: 'top' },
                        }}
                        onHiding={() => {
                            setViewAddMolecule(false)
                        }}
                        dragEnabled={false}
                        showCloseButton={true}
                        wrapperAttr={
                            {
                                class: "create-popup mr-[15px]"
                            }
                        } />
                    }
                    {viewEditMolecule && <Popup
                        title="Edit Molecule"
                        visible={viewEditMolecule}
                        contentRender={() => (
                            <EditMolecule
                                editMolecules={editMolecules}
                                libraryId={library_id}
                                projectId={projectId}
                                userData={userData}
                                setViewEditMolecule={setViewEditMolecule}
                                callLibraryId={callLibraryId} />
                        )}
                        resizeEnabled={true}
                        hideOnOutsideClick={true}
                        defaultWidth={900}
                        defaultHeight={'100%'}
                        position={{
                            my: { x: 'right', y: 'top' },
                            at: { x: 'right', y: 'top' },
                        }}
                        onHiding={() => {
                            setViewEditMolecule(false)
                        }}
                        dragEnabled={false}
                        showCloseButton={true}
                        wrapperAttr={
                            {
                                class: "create-popup mr-[15px]"
                            }
                        } />
                    }
                    <div className='flex justify-center mt-[25px]'>
                        <span className='text-themeGreyColor'>
                            {tableData.length}
                            <span className='pl-[3px]'>
                                {tableData.length === 1 ? 'molecule' : 'molecules'}
                            </span>
                            <span className='pl-[2px]'> found</span>
                        </span>
                        {!!tableData.length && <span>&nbsp;|&nbsp;</span>}
                        {!!tableData.length &&
                            <span className={
                                `text-themeSecondayBlue 
                                                pl-[5px] 
                                                font-bold pb-[10px]`
                            }>Select All {tableData.length}
                            </span>}
                    </div>
                </div >
            }
        </>
    )
}