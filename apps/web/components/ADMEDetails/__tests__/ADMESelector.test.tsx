/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import { editOrganization, getOrganizationById } from '@/components/Organization/service';
import ADMESelector from '../ADMESelector';
import { ContainerType, ProjectDataFields } from '@/lib/definition';

const orgDetails = {
    id: 24,
    name: 'org2',
    type: ContainerType.CLIENT_ORGANIZATION
};

const userData = {
    id: 1,
    organization_id: 1,
    email_id: "forum.tanna@external.milliporesigma.com",
    first_name: "Forum",
    last_name: "Tanna",
    myRoles: [],
    status: 'active',
    user_role: [{
        role: {
            id: 6,
            priority: 1,
            type: "admin",
            number: 1,
            name: "admin"
        },
        role_id: 6
    }],
    orgUser: {
        id: 1, name: 'System Admin', first_name: "Forum",
        last_name: "Tanna",
        email_id: "forum.tanna@external.milliporesigma.com",
        status: "active",
        type: "Internal",
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            },
            role_id: 6
        }],
        organization: {
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
        },
        user_id: 1,
    }
}

const projectMockData = {
    id: 1,
    name: 'Proj2',
    target: '',
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    created_at: new Date(),
    updated_at: new Date(),
    owner_id: 1,
    updated_by: 1,
    owner: userData.orgUser,
    container_access_permission: [],
    container: {
        id: 1,
        name: 'Merck',
        description: 'Merck Corporation',
        logo: 'logo.jpg',
        created_by: 1,
        created_at: '2024-08-05T15:44:09.158Z',
        updated_at: '2024-08-05T15:44:09.158Z',
        status: 'active',
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            }
        }],
        email_id: 'abc@email.com',
        is_active: true,
        orgUser: [userData.orgUser],
        metadata: {
            functionalAssay1: '',
            functionalAssay2: '',
            functionalAssay3: '',
            functionalAssay4: '',
        },
        inherits_configuration: true,
        owner_id: 1,
        type: 'Retrosynthesis',
    },
    user: userData,
    sharedUsers: [userData.orgUser],
    userWhoUpdated: userData,
    userWhoCreated: userData,
    metadata: { type: 'Retrosynthesis', target: '' }, inherits_configuration: true,
} as ProjectDataFields

const libMockData = {
    id: 40,
    parent_id: 31,
    type: "L",
    name: "new test lib",
    description: '',
    owner_id: 11,
    inherits_configuration: true,
    project: projectMockData,
    metadata: {},
    is_active: true,
    created_at: new Date(),
    created_by: 11,
    updated_at: new Date(),
    updated_by: 11,
    libraryMolecules: [],
    libraryReactions: [],
    owner: userData.orgUser,
    userWhoUpdated: userData,
    userWhoCreated: userData,
    container_access_permission: [],
    container: {
        id: 1,
        name: 'Merck',
        description: 'Merck Corporation',
        logo: 'logo.jpg',
        created_by: 1,
        created_at: '2024-08-05T15:44:09.158Z',
        updated_at: '2024-08-05T15:44:09.158Z',
        status: 'active',
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            }
        }],
        email_id: 'abc@email.com',
        is_active: true,
        orgUser: [userData.orgUser],
        metadata: {
            functionalAssay1: '',
            functionalAssay2: '',
            functionalAssay3: '',
            functionalAssay4: '',
        },
        inherits_configuration: true,
        owner_id: 1,
        type: 'Retrosynthesis',
    }
}

const mockData = {
    "id": "24",
    "parent_id": "1",
    "type": "CO",
    "name": "org2",
    "description": null,
    "owner_id": 11,
    "inherits_configuration": true,
    "config": {
        "ADMEParams": [
            {
                "Solubility": {
                    "max": 79.1,
                    "min": 10.4
                }
            },
            {
                "CLint": {
                    "max": 9007199254740991,
                    "min": 0
                }
            },
            {
                "Fub": {
                    "max": 9007199254740991,
                    "min": 0
                }
            },
            {
                "Caco2": {
                    "max": 70.3,
                    "min": 14.3
                }
            },
            {
                "HepG2": {
                    "max": 9007199254740991,
                    "min": 0
                }
            },
            {
                "hERG": {
                    "max": 9007199254740991,
                    "min": 0
                }
            }
        ]
    },
    "metadata": null,
    "is_active": true,
    "created_at": "2024-12-26T18:44:07.713Z",
    "created_by": 1,
    "updated_at": "2024-12-26T18:45:25.732Z",
    "updated_by": null
}

jest.mock('@/components/Organization/service', () => ({
    getOrganizationById: jest.fn(),
    editOrganization: jest.fn(),
}));


describe('ADME details sliders should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
        (getOrganizationById as jest.Mock).mockResolvedValue(mockData);
    });

    test('Changing slider should work as expected for organization', async () => {
        await act(async () => {
            render(
                <ADMESelector
                    organizationId={orgDetails.id}
                    setIsDirty={jest.fn()}
                    isDirty={true}
                    childRef={null as any}
                    reset={''}
                />
            );
        });

        const sliders = screen.getAllByRole('slider');
        expect(sliders.length).not.toBe(0);
        // Simulate mouse move (moving the slider)
        fireEvent.mouseMove(sliders[0], { clientX: 2.1 });
    }, 60000);

    test('Changing slider should work as expected for project and library', async () => {
        await act(async () => {
            render(
                <ADMESelector
                    data={projectMockData}
                    type={ContainerType.PROJECT}
                    organizationId={24}
                    setIsDirty={jest.fn()}
                    isDirty={true}
                    childRef={null as any}
                    reset={''}
                />
            );
        });

        const sliders = screen.getAllByRole('slider');
        expect(sliders.length).not.toBe(0);
        fireEvent.mouseMove(sliders[0], { clientX: 2.1 });
    }, 60000);

    test('Update button should work as expected', async () => {
        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        await act(async () => {
            render(
                <ADMESelector
                    organizationId={orgDetails.id}
                    setIsDirty={jest.fn()}
                    isDirty={true}
                    childRef={null as any}
                    reset={''}
                />
            );
        });
        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeInTheDocument();
        fireEvent.click(updateButton);
    }, 60000);

    test('Update button should work as expected for project', async () => {
        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        await act(async () => {
            render(
                <ADMESelector
                    data={projectMockData}
                    type={ContainerType.PROJECT}
                    organizationId={24}
                    setIsDirty={jest.fn()}
                    isDirty={true}
                    childRef={null as any}
                    reset={''}
                />
            );
        });
        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeInTheDocument();
        fireEvent.click(updateButton);
    }, 60000);

    test('Update button should work as expected for library', async () => {
        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        await act(async () => {
            render(
                <ADMESelector
                    data={libMockData}
                    type={ContainerType.LIBRARY}
                    organizationId={24}
                    setIsDirty={jest.fn()}
                    isDirty={true}
                    childRef={null as any}
                    reset={''}
                />
            );
        });
        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeInTheDocument();
        fireEvent.click(updateButton);
    }, 60000);

    test('Update button should work as expected when api returns an error', async () => {
        const mockResponse = { error: 'Unexpected error occured' };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        await act(async () => {
            render(
                <ADMESelector
                    organizationId={orgDetails.id}
                    setIsDirty={jest.fn()}
                    isDirty={true}
                    childRef={null as any}
                    reset={''}
                />
            );
        });

        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeInTheDocument();
        await act(() => fireEvent.click(updateButton));
    }, 60000);
});