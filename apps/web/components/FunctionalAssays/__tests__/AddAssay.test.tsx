/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import AddAssay from '../AddAssay';
import { editOrganization } from '@/components/Organization/service';
import { ContainerType } from '@/lib/definition';
import { editProject } from '@/components/Projects/projectService';
import { editLibrary } from '@/components/Libraries/service';

const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });
const mockReset = jest.fn();
const setShowAddAssayForm = jest.fn();
const cleanup = jest.fn();
const mockValidate = jest.fn().mockReturnValue({ isValid: true, check: 'jhgff' });

const mockInstance = {
    option: mockOption,
    reset: mockReset,
    validate: mockValidate,
};

// Mock the formRef
const mockFormRef = {
    current: {
        instance: () => mockInstance,
    },
};

jest.mock('@/components/Organization/service', () => ({
    editOrganization: jest.fn(),
}));

jest.mock('@/components/Projects/projectService', () => ({
    editProject: jest.fn(),
}));

jest.mock('@/components/Libraries/service', () => ({
    editLibrary: jest.fn(),
}));

const organizaitonData = {
    id: 1,
    name: 'Merck',
    description: 'Merck Corporation',
    logo: 'logo.jpg',
    created_by: 1,
    created_at: '2024-08-05T15:44:09.158Z',
    updated_at: '2024-08-05T15:44:09.158Z',
    status: 'active',
    type: 'Internal',
    user_role: [{
        role: {
            id: 6,
            priority: 1,
            type: "admin",
            number: 1,
            name: "admin"
        },
        role_id: 6
    }]
};

const projectData = {
    id: 1,
    name: 'Proj2',
    target: null,
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    created_at: '2024-10-17T08:18:35.505Z',
    updated_at: '2024-10-17T08:18:35.505Z',
    owner_id: 1,
    updated_by: 1,
    owner: {
        id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email_id: 'sys_admin@external.milliporesigma.com'
    },
    library: { name: 'fauxbio' },
    libraries: [
        {
            id: 1,
            name: 'EGFR-v1',
            description: 'Smaple data',
            project_id: 2,
            created_at: '2024-10-17T09:53:33.045Z',
            updated_at: null,
            owner_id: 7,
            updated_by: null,
            owner: {
                id: 1,
                first_name: 'System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com'
            }
        },
        {
            id: 2,
            name: 'Lib3',
            description: 'Smaple data',
            project_id: 2,
            created_at: '2024-10-17T09:53:33.070Z',
            updated_at: null,
            owner_id: 7,
            updated_by: null,
            owner: {
                id: 1,
                first_name: 'System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com'
            }
        }
    ]
};

describe('AddAssay should work as expected', () => {
    test('changing radio button should work as expected', async () => {
        const type = '';
        await act(async () => {
            render(
                <AddAssay
                    formRef={mockFormRef}
                    setShowAddAssayForm={
                        setShowAddAssayForm}
                    data={organizaitonData}
                    cleanup={cleanup}
                    type={type || ''}
                    assayValue={[]}
                    loggedInUser={1}
                />
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });

        const radioButton = screen.getAllByRole('radio');
        expect(radioButton[0]).toBeChecked();

        await act(async () => {
            fireEvent.click(radioButton[1]);
        });
        expect(radioButton[1]).toBeChecked();
        expect(screen.getByPlaceholderText('Protocol')).toBeInTheDocument();
    });

    test('cancel button works as expected', async () => {
        const type = '';
        await act(async () => {
            render(
                <AddAssay
                    formRef={mockFormRef}
                    setShowAddAssayForm={
                        setShowAddAssayForm}
                    data={organizaitonData}
                    cleanup={cleanup}
                    type={type || ''}
                    assayValue={[]}
                    loggedInUser={1}
                />
            );
        });

        const cancelButton = screen.getByText('Cancel');
        await act(async () => { fireEvent.click(cancelButton) });
        expect(setShowAddAssayForm).toHaveBeenCalled();
    });

    test('add assay works as expected with valid data for organization', async () => {
        const type = '';
        await act(async () => {
            render(
                <AddAssay
                    formRef={mockFormRef}
                    setShowAddAssayForm={
                        setShowAddAssayForm}
                    data={organizaitonData}
                    cleanup={cleanup}
                    type={type || ''}
                    assayValue={[]}
                    loggedInUser={1}
                />
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('Functional Assay Name');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'New Assay'
                }
            })
        });

        expect(screen.getByText('Submit')).toBeInTheDocument();

        const createButton = screen.getByText('Submit');
        await act(async () => { fireEvent.click(createButton) });
        expect(editOrganization).toHaveBeenCalled();
    });

    test('add assay works as expected with valid data for project', async () => {
        const type = ContainerType.PROJECT;
        await act(async () => {
            render(
                <AddAssay
                    formRef={mockFormRef}
                    setShowAddAssayForm={
                        setShowAddAssayForm}
                    data={projectData}
                    cleanup={cleanup}
                    type={type || ''}
                    assayValue={[]}
                    loggedInUser={1}
                />
            );
        });

        const mockResponse = { error: null };
        act(() => { (editProject as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('Functional Assay Name');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'New Assay'
                }
            })
        });

        expect(screen.getByText('Submit')).toBeInTheDocument();

        const createButton = screen.getByText('Submit');
        await act(async () => { fireEvent.click(createButton) });
        expect(editProject).toHaveBeenCalled();
    });

    test('add assay works as expected with valid data for library', async () => {
        const type = ContainerType.LIBRARY;
        await act(async () => {
            render(
                <AddAssay
                    formRef={mockFormRef}
                    setShowAddAssayForm={
                        setShowAddAssayForm}
                    data={projectData}
                    cleanup={cleanup}
                    type={type || ''}
                    assayValue={[]}
                    loggedInUser={1}
                />
            );
        });

        const mockResponse = { error: null };
        act(() => { (editLibrary as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('Functional Assay Name');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'New Assay'
                }
            })
        });

        expect(screen.getByText('Submit')).toBeInTheDocument();

        const createButton = screen.getByText('Submit');
        await act(async () => { fireEvent.click(createButton) });
        expect(editLibrary).toHaveBeenCalled();
    });
});
