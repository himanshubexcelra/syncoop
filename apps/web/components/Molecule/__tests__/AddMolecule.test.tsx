import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddMolecule from '../AddMolecule/AddMolecule';
import { UserData } from '@/lib/definition';
import { downloadCSV } from '../service';

jest.mock('../service', () => ({
    downloadCSV: jest.fn(),
    uploadMoleculeFile: jest.fn().mockResolvedValue({ message: 'File uploaded successfully' }),
    uploadMoleculeSmiles: jest.fn().mockResolvedValue({ rejected_smiles: [] }),
}));


jest.mock('@/utils/auth', () => ({
    getUserData: jest.fn().mockResolvedValue({
        userData: { id: 'user123', organization_id: 'org123' },
    }),
}));
// eslint-disable-next-line react/display-name
jest.mock('@/components/KetcherTool/KetcherBox', () => () => <div>KetcherDrawBox Mock</div>);

const mockUserData: UserData = {
    organization_id: 1,
    orgUser: {
        type: 'External',
        id: 0,
        status: '',
        organization: {
            id: 3,
        },
        user_role: [],
        first_name: '',
        email_id: '',
        last_name: ''
    },
    myRoles: ['user'],
    id: 123,
    user_role: [],
    email_id: '',
    first_name: '',
    last_name: ''
};

const mockProps = {
    userData: mockUserData,
    libraryId: '1',
    projectId: '2',
    setViewAddMolecule: jest.fn(),
    callLibraryId: jest.fn(),
};

describe('AddMolecule Component', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'KetcherFunctions', {
            value: {
                exportSmile: jest.fn().mockResolvedValue('C1=CC=CC=C1'),
            },
            writable: true,
        });
    });

    afterAll(() => {
        delete (window as any).KetcherFunctions;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders AddMolecule component', () => {
        render(<AddMolecule {...mockProps} />);
        expect(screen.getByText('Upload CSV/SDF')).toBeInTheDocument();
        expect(screen.getByText('Draw a Molecule')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Molecule name')).toBeInTheDocument();
    });

    test('displays file upload area and allows file selection', async () => {
        render(<AddMolecule {...mockProps} />);

        const fileInput = screen.getByText('Drag and drop a file here or click to browse');
        expect(fileInput).toBeInTheDocument();
        const browseButton = screen.getByText('Browse');
        fireEvent.click(browseButton);
        const file = new File(['sample molecule file'], 'sample.csv', { type: 'text/csv' });
        const fileInputField = screen.getByTestId('file-input') as HTMLInputElement;
        fireEvent.change(fileInputField, { target: { files: [file] } });

        expect(screen.getByText(file.name)).toBeInTheDocument();
    });

    test('displays the reset dialog when clicking reset', () => {
        render(<AddMolecule {...mockProps} />);

        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);

        expect(screen.queryAllByRole('dialog').length).toBeGreaterThan(0);
    });

    test('downloads template when clicking "Download Template" button', () => {
        render(<AddMolecule {...mockProps} />);

        const downloadButton = screen.getByText('Download Template');
        fireEvent.click(downloadButton);

        expect(downloadCSV).toHaveBeenCalledWith(
            { col1: 'ID (optional)', col2: 'SMILES (mandatory)' },
            [],
            'molecule_template'
        );
    });
});
