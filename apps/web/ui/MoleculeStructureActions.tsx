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
    moleculeId: number;
    onZoomClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

const MoleculeStructureActions: React.FC<MoleculeStructureActionsProps> = ({
    smilesString,
    moleculeId,
    onZoomClick,
    onEditClick,
    onDeleteClick,
}) => {
    return (
        <span className="flex justify-center items-center gap-[7.5px]">
            <MoleculeStructure height={80} width={80}
                svgMode={true} structure={smilesString} id={`smiles-${moleculeId}`} />
            <Button onClick={onZoomClick} render={() =>
                <Image src="/icons/zoom.svg" width={24} height={24} alt="zoom" />} />
            <Button onClick={onEditClick} render={() =>
                <Image src="/icons/edit.svg" width={24} height={24} alt="edit" />} />
            <Button onClick={onDeleteClick} render={() =>
                <Image src="/icons/delete.svg" width={24} height={24} alt="delete" />} />
        </span>
    );
};

export default MoleculeStructureActions;
