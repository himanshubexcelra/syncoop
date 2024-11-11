/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import Image from 'next/image';
import { Button } from 'devextreme-react';
import dynamic from "next/dynamic";

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

interface MoleculeStructureActionsProps {
    smilesString: string;
    molecule_id: number;
    onZoomClick: () => void;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
    enableEdit?: boolean;
    enableDelete?: boolean;
}

const MoleculeStructureActions: React.FC<MoleculeStructureActionsProps> = ({
    smilesString,
    molecule_id,
    onZoomClick,
    onEditClick,
    onDeleteClick,
    enableEdit = false,
    enableDelete = false
}) => {
    return (
        <span className="flex justify-center items-center gap-[7.5px]">
            <MoleculeStructure height={80} width={80}
                svgMode={true} structure={smilesString} id={`smiles-${molecule_id}`} />
            <Button onClick={onZoomClick} render={() =>
                <Image src="/icons/zoom.svg" width={24} height={24} alt="zoom" />} />
            {enableEdit && <Button onClick={onEditClick} render={() =>
                <Image src="/icons/edit.svg" width={24} height={24} alt="edit" />} />}
            {enableDelete && <Button onClick={onDeleteClick} render={() =>
                <Image src="/icons/delete.svg" width={24} height={24} alt="delete" />} />}
        </span>
    );
};

export default MoleculeStructureActions;
