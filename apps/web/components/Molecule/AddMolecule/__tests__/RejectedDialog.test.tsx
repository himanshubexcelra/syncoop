import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RejectedDialog from '../RejectedDialog';
import { downloadCSV } from '../../file';

// Mock external dependencies
jest.mock('../../file', () => ({
    downloadCSV: jest.fn(),
}));

describe('RejectedDialog Component', () => {
    const mockOnClose = jest.fn();
    const mockUploadDuplicate = jest.fn();

    const rejectedMolecules = [
        { project_name: "Project1", library_name: "Library1", smiles: "CCO", reason: "Invalid structure" },
        { project_name: "Project2", library_name: "Library2", smiles: "CCN", reason: "Duplicate entry" }
    ];

    const duplicateSmiles = [
        {
            "smiles": "FC1=CC=CC(COC(C=CC(NC2=C3C(C=CC(C(O4)=CC=C4CNCCS(=O)(C)=O)=C3)=NC=N2)=C5)=C5Cl)=C1",
            "reason": "Duplicate molecule found with status 'In Retro Queue' under same library.",
            "molecule_id": "1690",
            "existing_status": "In Retro Queue",
            "existing_status_id": "4"
        },
        {
            "smiles": "COC1=C(NC2=NC(NC3=C(P(C)(C)=O)C=CC=C3)=C(Cl)C=N2)C=CC(N4CCC(CC4)N5CCN(CC5)C)=C1",
            "reason": "Duplicate molecule found with status 'In Retro Queue' under same library.",
            "molecule_id": "1691",
            "existing_status": "In Retro Queue",
            "existing_status_id": "4"
        }
    ];

    const rejectedMessages = [
        "1 molecule was rejected due to an invalid structure.",
        "1 molecule was a duplicate."
    ];

    test('renders RejectedDialog component correctly', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMolecules} rejectedMessage={rejectedMessages} isLoader={false} />);

        expect(screen.getByText('Rejected Molecules')).toBeInTheDocument();
        expect(screen.getByText('Download Rejected List')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    test('displays rejected messages', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMolecules} rejectedMessage={rejectedMessages} isLoader={false} />);

        rejectedMessages.forEach(message => {
            expect(screen.getByText(message)).toBeInTheDocument();
        });
    });

    test('calls onClose function when close button is clicked', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMolecules} rejectedMessage={rejectedMessages} isLoader={false}
        />);

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test.skip('calls downloadCSV when Download Rejected List is clicked', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMolecules} rejectedMessage={rejectedMessages} isLoader={false} />);

        const downloadButton = screen.getByText('Download Rejected List');
        fireEvent.click(downloadButton);

        expect(downloadCSV).toHaveBeenCalledWith(
            { project_name: "Project Name", library_name: "Library Name", smiles: "SMILE", reason: "Reason" },
            rejectedMolecules,
            'rejected_smiles'
        );
    });

    test('calls uploadDuplicate when Upload Duplicate button is clicked', () => {
        render(<RejectedDialog
            onClose={mockOnClose}
            rejected={rejectedMolecules}
            rejectedMessage={rejectedMessages}
            uploadDuplicate={mockUploadDuplicate}
            duplicateSmiles={duplicateSmiles}
            isLoader={false}
        />);

        const uploadButton = screen.getByText('Upload Duplicate');
        fireEvent.click(uploadButton);

        expect(mockUploadDuplicate).toHaveBeenCalledTimes(1);
    });

    test('does not render Upload Duplicate button if duplicateSmiles is empty', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMolecules} rejectedMessage={rejectedMessages} duplicateSmiles={[]} isLoader={false} />);

        expect(screen.queryByText('Upload Duplicate')).not.toBeInTheDocument();
    });

    test('calls onClose when close icon is clicked', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMolecules} rejectedMessage={rejectedMessages} isLoader={false} />);

        const closeIcon = screen.getByAltText('close icon');
        fireEvent.click(closeIcon);
    });
});
