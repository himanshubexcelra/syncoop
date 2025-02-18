import {
    MoleculeType, ProjectDataFields, LibraryFields,
    RejectedSmiles,
} from "@/lib/definition"
import Image from "next/image";
import styles from './CopyDialog.module.css'
import { useCallback, useState, useTransition } from "react";
import { List, LoadIndicator } from "devextreme-react";
import DataSource from "devextreme/data/data_source";
import { uploadMoleculeSmiles } from "../service";
import toast from "react-hot-toast";
import { delay, isAdmin, transformMoleculeData } from "@/utils/helpers";
import { DELAY } from "@/utils/constants";
import { Messages } from "@/utils/message";
import RejectedDialog from "../AddMolecule/RejectedDialog";
import DialogPopUp from "@/ui/DialogPopUp";

type CopyDialogProps = {
    selectedMolecules: MoleculeType[];
    projectData: ProjectDataFields;
    setCopyDialog: (value: boolean) => void;
    user_id: number;
    myRoles: string[];
    callLibraryId: () => void;
    currentLibraryId?: number;
    organizationId: string;
}
const RejectDialogProperties = {
    width: 465,
    height: 180,
}
function filterLibrariesByUserAccess(libData: LibraryFields[] = [], userId: number) {
    return libData.filter((lib: LibraryFields) =>
        lib?.owner_id === userId ||
        (lib.container_access_permission &&
            lib.container_access_permission.some(permission => permission.user_id === userId))
    );
}
const sortByFields = [
    { label: 'Name', field: 'name' },
    { label: 'Updation time', field: 'updated_at' },
    { label: 'Recent', field: 'created_at' },
]
export default function CopyDialog(props: CopyDialogProps) {
    const {
        selectedMolecules,
        projectData,
        setCopyDialog,
        user_id,
        callLibraryId,
        myRoles,
        currentLibraryId,
        organizationId,

    } = props
    const [sortBy, setSortBy] = useState('name')
    const [selectedLibraries, setSelectedLibraries] = useState<LibraryFields[]>([])
    const [submitText, setSubmitText] = useState('Copy');
    const [submitLoadIndicatorVisible, setSubmitLoadIndicatorVisible] = useState(false);
    const [showRejectedDialog, setShowRejectedDialog] = useState(false)
    const [rejectedMessage, setRejectedMessage] = useState<string[]>([]);
    const [rejected, setRejected] = useState<RejectedSmiles[]>([])
    const [, startTransition] = useTransition()
    const [duplicateSmiles, setDuplicateSmiles] = useState<string[]>([]);
    const [isLoader, setIsLoader] = useState(false);
    const [selectedLibraryId, setSelectedLibraryId] = useState<number[]>([]);
    const [updateSmiles, setUploadSmiles] = useState<number>(0);

    const filterCurrentLibrary = ['id', '<>', currentLibraryId]
    const hideRejectPopUp = () => {
        setShowRejectedDialog(false);
        if (updateSmiles > 0) {
            callLibraryId();
        }
        setCopyDialog(false)
    }
    const admin = isAdmin(myRoles);
    const libData = admin
        ? projectData.other_container
        : filterLibrariesByUserAccess(projectData.other_container, user_id)

    function getUniqueSmiles(molecules: any[]): string[] {
        const uniqueSmiles = Array.from(new Set(molecules.map(mol => mol.smiles)));
        return uniqueSmiles;
    }


    const uploadDuplicateMolecule = () => {
        setIsLoader(true);
        const copyMoleculeData = transformMoleculeData(duplicateSmiles);
        const uniqueSmileList = getUniqueSmiles(duplicateSmiles);
        const formData = new FormData();
        formData.append('smiles', JSON.stringify(uniqueSmileList));
        formData.append('createdBy', user_id.toString());
        formData.append('library_id', JSON.stringify(selectedLibraryId));
        formData.append('project_id', copyMoleculeData.projectId?.toString());
        formData.append('organization_id', organizationId.toString());
        formData.append('checkDuplicate', 'false');
        formData.append('source_molecule_name', '');
        startTransition(async () => {
            await uploadMoleculeSmiles(formData).then(async (result) => {
                setUploadSmiles(result?.uploaded_smiles_count);
                setRejected(result?.rejected_smiles.
                    concat(result?.duplicate_smiles));
                if (result?.error) {
                    const toastId = toast.error(result?.error?.detail);
                    await delay(DELAY);
                    toast.remove(toastId);
                } else {
                    if (result?.duplicate_smiles?.length) {
                        setDuplicateSmiles(result?.duplicate_smiles)
                    }
                    if (result?.rejected_smiles?.length || result?.duplicate_smiles?.length) {
                        setRejectedMessage(Messages.displayMoleculeSucessMsg
                            (result?.uploaded_smiles?.length, result?.rejected_smiles?.length,
                                result?.duplicate_smiles?.length))
                        setShowRejectedDialog(true);
                        setIsLoader(false);
                    } else {
                        const toastId = toast.success(
                            `${result?.message}`
                        );
                        await delay(DELAY);
                        toast.remove(toastId);
                        setCopyDialog(false);
                        callLibraryId();
                        setIsLoader(false);
                    }
                }
            }, async (error) => {
                const toastId = toast.error(error.message);
                await delay(DELAY);
                toast.remove(toastId);
            });
            setSubmitLoadIndicatorVisible(false);
            setSubmitText('Copy');
        });
    }
    const rejectContentProps = {
        rejected,
        rejectedMessage,
        onClose: hideRejectPopUp,
        uploadDuplicate: uploadDuplicateMolecule,
        duplicateSmiles: duplicateSmiles,
        isLoader: isLoader
    }
    const onClose = () => {
        setCopyDialog(false)
    }

    const message = Messages.moleculeCopyHeadline(selectedMolecules?.length);
    const [dataSource, setDataSource] = useState(
        new DataSource({
            store: libData,
            filter: filterCurrentLibrary,
            sort: [{ selector: 'name', desc: false }]
        })
    );

    const handleSortChange = (sortKey: string) => {
        setSortBy(sortKey)
        setDataSource(
            new DataSource({
                store: libData,
                filter: filterCurrentLibrary,
                sort: [{
                    selector: sortKey,
                    desc: sortKey !== 'name'
                }]
            })
        );
    };

    const onSelectedItemKeysChange = useCallback(
        (selectedLibrary: LibraryFields[]) => {
            setSelectedLibraries(selectedLibrary)
        },
        []
    );

    const onSubmit = async () => {
        setSubmitText('')
        setSubmitLoadIndicatorVisible(true)
        const smileList = selectedMolecules.map(molecule => molecule.smiles_string);
        const libraryId = selectedLibraries.map(library => Number(library.id));
        const projectId = selectedLibraries.length > 0 ? selectedLibraries[0].parent_id : null;
        const organizationId = selectedMolecules.length > 0 ? selectedMolecules[0].organization_id : null;
        const formData = new FormData();
        formData.append('smiles', JSON.stringify(smileList));
        formData.append('createdBy', user_id.toString());
        formData.append('library_id', JSON.stringify(libraryId));
        formData.append('project_id', projectId?.toString() ?? '');
        formData.append('organization_id', organizationId?.toString() ?? '');
        formData.append('checkDuplicate', 'true');
        formData.append('source_molecule_name', '');
        setSelectedLibraryId(libraryId);
        startTransition(async () => {
            await uploadMoleculeSmiles(formData).then(async (result) => {
                setUploadSmiles(result?.uploaded_smiles_count)
                if (result?.error) {
                    const toastId = toast.error(result?.error?.detail);
                    await delay(DELAY);
                    toast.remove(toastId);
                } else {
                    setRejected(result?.rejected_smiles.
                        concat(result?.duplicate_smiles))
                    if (result?.duplicate_smiles?.length) {
                        setDuplicateSmiles(result?.duplicate_smiles)
                    }
                    if (result?.rejected_smiles?.length || result?.duplicate_smiles?.length) {
                        setRejectedMessage(Messages.displayMoleculeSucessMsg
                            (result?.uploaded_smiles?.length, result?.rejected_smiles?.length,
                                result?.duplicate_smiles?.length))
                        setShowRejectedDialog(true);
                        setIsLoader(false);
                    } else {
                        const toastId = toast.success(
                            `${result?.message}`
                        );
                        await delay(DELAY);
                        toast.remove(toastId);
                        setCopyDialog(false);
                        callLibraryId();
                        setIsLoader(false);
                    }
                }
            }, async (error) => {
                const toastId = toast.error(error.message);
                await delay(DELAY);
                toast.remove(toastId);
            });
            setSubmitLoadIndicatorVisible(false);
            setSubmitText('Copy')
        });
    }

    return (
        <>
            <div className="flex justify-end">
                <Image
                    className='cursor-pointer'
                    src="/icons/cross-icon.svg"
                    alt="close icon"
                    width={21.1}
                    height={22.5}
                    onClick={onClose} />
            </div>
            <div className={`${styles.headlineMessage} mb-4`}>
                {message}
            </div>
            <div className='flex items-center mb-2'>
                <span className={`text-normal mr-[5px] w-[43px]`}>
                    Sort by:
                </span>
                <select
                    value={sortBy}
                    title="sort"
                    className={`cursor-pointer librarySortSelect`}
                    onChange={(e) => handleSortChange(e.target.value)}>
                    {sortByFields.map((option, index) => (
                        <option key={index} value={option.field}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.borderGrid}>
                <List
                    dataSource={dataSource}
                    height={330}
                    showSelectionControls={true}
                    selectionMode={"multiple"}
                    displayExpr="name"
                    onSelectedItemKeysChange={onSelectedItemKeysChange}
                ></List>
            </div>
            <div className="flex justify-start gap-4 mt-5">
                <button className={submitLoadIndicatorVisible || selectedLibraries.length === 0
                    ? 'disableButton w-[52px]'
                    : 'primary-button'}
                    disabled={submitLoadIndicatorVisible || selectedLibraries.length === 0}
                    onClick={onSubmit}>
                    <LoadIndicator className={
                        `button-indicator ${styles.white}`
                    }
                        visible={submitLoadIndicatorVisible}
                        height={20}
                        width={20} />{submitText}</button>
                <button className='secondary-button' onClick={onClose}>Cancel</button>
            </div>
            <DialogPopUp {
                ...{
                    visible: showRejectedDialog,
                    dialogProperties: RejectDialogProperties,
                    Content: RejectedDialog,
                    hidePopup: hideRejectPopUp,
                    contentProps: rejectContentProps,
                }
            } />
        </>)
}