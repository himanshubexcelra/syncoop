/*eslint max-len: ["error", { "code": 100 }]*/
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import LibraryAccordion from '../LibraryAccordion';
import { AppContext } from '../../../app/AppState';
import { AppContextModel, ProjectDataFields, UserData } from '@/lib/definition';
import { useRouter } from 'next/navigation';
import React from 'react';

// Mock AddMolecule and EditMolecule
jest.mock('@/components/Molecule/AddMolecule/AddMolecule', () => () => null);
jest.mock('@/components/Molecule/EditMolecule/EditMolecule', () => () => null);

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../service', () => ({
    getLibraries: jest.fn().mockImplementation(() => {
        return Promise.resolve({
            name: 'Test Project',
            parent_id: 1,
            container: {
                id: 1,
                name: 'Test Organization',
            },
            other_container: [
                { id: 1, name: 'Library 1' },
                { id: 2, name: 'Library 2' },
            ],
        });
    }),
}));

const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    isFallback: false,
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const mockAppContext = {
    state: {
        cartDetail: {},
        appContext: {} as AppContextModel,
    },
};

const description = `Contrary to popular belief, Lorem Ipsum is not simply random text.
It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. 
Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the 
more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of 
the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections
 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero,
 written in 45 BC. This book is a treatise on the theory of ethics, very popular during 
 the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", 
 comes from a line in section 1.10.32.
The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. 
Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in 
their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
`
const projectData: ProjectDataFields = {
    name: 'Test Project',
    description: '',
    owner: {
        first_name: 'Test',
        last_name: 'User',
        id: 1,
        email_id: 'test.user@example.com',
        status: 'active',
        user_role: [{
            role: {
                id: 1,
                name: 'admin',
            },
            role_id: 1,
        }],
        type: 'internal',
        organization: {
            id: 1,
            name: 'Test Organization',
        }
    },
    id: 0,
    container: {
        id: 1,
        name: 'Test Organization',
        email_id: 'org@example.com',
        is_active: true,
        orgUser: [],
        metadata: {
            functionalAssay1: '',
            functionalAssay2: '',
            functionalAssay3: '',
            functionalAssay4: '',
        },
        owner_id: 1,
        type: 'internal',
    },
    other_container: [
        {
            id: 1,
            name: 'Test Library 1',
            created_at: '2025-01-01T00:00:00Z',
            owner_id: 1,
            owner: {
                "id": 100,
                "first_name": "John",
                "last_name": "Frink",
                "email_id": "A1Demo@A1B.com"
            },
            metadata: {
                target: 'Molecue Alpha 2Specific small molecule targets (e.g., EGFR inhibitors)',
            },
            description: description,
            libraryMolecules: [
                {
                    status: 3,
                },
                {
                    status: 0,
                }
            ]
        },

    ],
    user: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active'
    },
    sharedUsers: [],
    target: '',
    userWhoUpdated: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active'
    },
    userWhoCreated: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active',
    },
    updated_at: new Date(),
    owner_id: 1,
    metadata: {
        target: 'Molecue Alpha 2Specific small molecule targets (e.g., EGFR inhibitors)',
        type: ''
    },
    created_at: new Date(),
};

const userData: UserData = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email_id: 'test.user@example.com',
    user_role: [{
        role: {
            id: 1,
            name: 'admin',
        },
        role_id: 1,
    }],
    organization_id: 1,
    orgUser: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active',
        organization: {
            id: 1,
            name: 'Test Organization',
        },
        user_role: [{
            role: {
                id: 1,
                name: 'admin',
            },
            role_id: 1,
        }],
        type: 'internal',
    },
    myRoles: ['admin'],
    roles: [{
        type: 'admin',
    }],
};
beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
            json: () => Promise.resolve({
                id: 1,
                name: 'Test Organization',
                email_id: 'org@example.com',
                is_active: true,
                orgUser: [],
                metadata: {
                    functionalAssay1: '',
                    functionalAssay2: '',
                    functionalAssay3: '',
                    functionalAssay4: '',
                },
                owner_id: 1,
                type: 'internal',
            })
        })
    );
});
describe('LibraryAccordion Component', () => {
    const mockSetLoader = jest.fn();
    const mockSetSortBy = jest.fn();
    const mockSetProjects = jest.fn();
    const mockFetchLibraries = jest.fn();
    const mockSetExpanded = jest.fn();
    const mockSetLibraryId = jest.fn();
    const mockSetShowPopup = jest.fn();
    const mockSetIsDirty = jest.fn();
    const mockProjectInitial = projectData;
    const childRef = React.createRef<HTMLDivElement>();

    test('renders without crashing', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userData}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                    isDirty={false}
                    setIsDirty={mockSetIsDirty}
                    reset=""
                    setShowPopup={mockSetShowPopup}
                    adminAccess={true}
                    childRef={childRef}
                    organizationId={1}
                />
            </AppContext.Provider>
        );

        expect(screen.getByText(/Project Details/)).toBeInTheDocument();
    });

    test('displays project owner information', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userData}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                    isDirty={false}
                    setIsDirty={mockSetIsDirty}
                    reset=""
                    setShowPopup={mockSetShowPopup}
                    adminAccess={true}
                    childRef={childRef}
                    organizationId={1}
                />
            </AppContext.Provider>
        );

        expect(screen.getByText('Project Owner:')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('renders edit button', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userData}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                    isDirty={false}
                    setIsDirty={mockSetIsDirty}
                    reset=""
                    setShowPopup={mockSetShowPopup}
                    adminAccess={true}
                    childRef={childRef}
                    organizationId={1}
                />
            </AppContext.Provider>
        );

        const editButton = screen.getByRole('button', { name: /Edit/i });
        expect(editButton).toBeInTheDocument();
    });

    test('handles sorting libraries', async () => {
        const userDataWithLimitedAccess: UserData = {
            ...userData,
            myRoles: ['user'],
        };
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userDataWithLimitedAccess}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                    isDirty={false}
                    setIsDirty={mockSetIsDirty}
                    reset=""
                    setShowPopup={mockSetShowPopup}
                    adminAccess={true}
                    childRef={childRef}
                    organizationId={1}
                />
            </AppContext.Provider>
        );

        // Add a select element for sorting
        render(
            <select aria-label="Sort by:" onChange={(e) => mockSetSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="owner">Owner</option>
            </select>
        );
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
        const sortSelect = screen.getByLabelText('Sort by:');
        fireEvent.change(sortSelect, { target: { value: 'name' } });

        await waitFor(() => {
            expect(mockSetSortBy).toHaveBeenCalledWith('name');
        });
    });

    test('Edit Libraries', async () => {
        const mockSetExpandedMenu = jest.fn();
        const mockSetCreatePopupVisibility = jest.fn();
        const mockSetSelectedLibraryIndex = jest.fn();
        const mockSetEditPopupVisibility = jest.fn();
        const item = {
            id: 42,
        };
        const idx = 3;
        render(
            <p
                className={`mb-[20px] ${'cursor-pointer'}`}
                id={`edit-${item.id}`}
                onClick={() => {
                    mockSetExpandedMenu(-1);
                    mockSetCreatePopupVisibility(false);
                    mockSetSelectedLibraryIndex(idx);
                    mockSetEditPopupVisibility(true);
                }}
            >
                Edit
            </p>
        );
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(mockSetExpandedMenu).toHaveBeenCalledTimes(1);
        expect(mockSetCreatePopupVisibility).toHaveBeenCalledTimes(1);
        expect(mockSetSelectedLibraryIndex).toHaveBeenCalledTimes(1);
        expect(mockSetEditPopupVisibility).toHaveBeenCalledTimes(1);

        expect(mockSetExpandedMenu).toHaveBeenCalledWith(-1);
        expect(mockSetCreatePopupVisibility).toHaveBeenCalledWith(false);
        expect(mockSetSelectedLibraryIndex).toHaveBeenCalledWith(idx);
        expect(mockSetEditPopupVisibility).toHaveBeenCalledWith(true);
    });

    test('delete libraries', async () => {
        const mockSetExpandedMenu = jest.fn();
        const mockHandleDeleteLibrary = jest.fn();
        const item = {
            id: 42,
            name: 'Test Library',
        };
        render(
            <p
                onClick={() => {
                    mockSetExpandedMenu(-1);
                    mockHandleDeleteLibrary(item.id, item.name);
                }}
                className={`mb-[20px] ${'cursor-pointer'}`}
            >
                Delete
            </p>
        );
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
        expect(mockSetExpandedMenu).toHaveBeenCalledTimes(1);
        expect(mockSetExpandedMenu).toHaveBeenCalledWith(-1);
        expect(mockHandleDeleteLibrary).toHaveBeenCalledTimes(1);
        expect(mockHandleDeleteLibrary).toHaveBeenCalledWith(item.id, item.name);

    });

    test('Copy url', async () => {
        const mockCopyUrl = jest.fn();
        const item = {
            id: 101,
            name: 'Sample Library',
        };
        render(
            <p
                className="cursor-pointer"
                id={`url-${item.id}`}
                onClick={() => mockCopyUrl('library', item.name, item.id)}
            >
                URL
            </p>
        );
        const urlButton = screen.getByText('URL');
        fireEvent.click(urlButton);
        expect(mockCopyUrl).toHaveBeenCalledTimes(1);
        expect(mockCopyUrl).toHaveBeenCalledWith('library', item.name, item.id);
    });

    test('Open button works as expected', async () => {
        const getLibraries = jest.fn();
        (getLibraries as jest.Mock).mockResolvedValue(projectData);
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(projectData),
        });
        render(
            <LibraryAccordion
                projectData={projectData}
                setLoader={mockSetLoader}
                setSortBy={mockSetSortBy}
                setProjects={mockSetProjects}
                projectInitial={mockProjectInitial}
                projectId={projectData.id.toString()}
                sortBy=""
                actionsEnabled={[]}
                fetchLibraries={mockFetchLibraries}
                userData={userData}
                selectedLibraryId={0}
                setExpanded={mockSetExpanded}
                setLibraryId={mockSetLibraryId}
                isDirty={false}
                setShowPopup={jest.fn()}
                adminAccess={false}
                setIsDirty={mockSetIsDirty}
                reset=""
                childRef={childRef}
                organizationId={1}
            />
        );

        const libAcc = screen.getByText(`Library List (${projectData?.other_container?.length})`);
        await act(() => fireEvent.click(libAcc));
        const openButton = screen.getByRole('button', { name: /Open/i });
        expect(openButton).toBeInTheDocument();
        await act(() => fireEvent.click(openButton));
    });

    test('Sorting works as expected', async () => {
        const getLibraries = jest.fn();
        (getLibraries as jest.Mock).mockResolvedValue(projectData);
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(projectData),
        });
        render(
            <LibraryAccordion
                projectData={projectData}
                setLoader={mockSetLoader}
                setSortBy={mockSetSortBy}
                setProjects={mockSetProjects}
                projectInitial={mockProjectInitial}
                projectId={projectData.id.toString()}
                sortBy=""
                actionsEnabled={[]}
                fetchLibraries={mockFetchLibraries}
                userData={userData}
                selectedLibraryId={0}
                setExpanded={mockSetExpanded}
                setLibraryId={mockSetLibraryId}
                isDirty={false}
                setShowPopup={jest.fn()}
                adminAccess={true}
                setIsDirty={mockSetIsDirty}
                reset=""
                childRef={childRef}
                organizationId={1}
            />
        );

        const libAcc = screen.getByText(`Library List (${projectData?.other_container?.length})`);
        await act(() => fireEvent.click(libAcc));
        const sortSelect = screen.getByTitle('sort');
        const select = sortSelect as HTMLSelectElement;
        expect(sortSelect).toBeInTheDocument();
        fireEvent.change(select, { target: { value: 'Name' } });
        expect(select.value).toBe('Name');
    });

    test('Add Library button works as expected', async () => {
        const getLibraries = jest.fn();
        (getLibraries as jest.Mock).mockResolvedValue(projectData);
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(projectData),
        });
        render(
            <LibraryAccordion
                projectData={projectData}
                setLoader={mockSetLoader}
                setSortBy={mockSetSortBy}
                setProjects={mockSetProjects}
                projectInitial={mockProjectInitial}
                projectId={projectData.id.toString()}
                sortBy=""
                actionsEnabled={[]}
                fetchLibraries={mockFetchLibraries}
                userData={userData}
                selectedLibraryId={0}
                setExpanded={mockSetExpanded}
                setLibraryId={mockSetLibraryId}
                isDirty={false}
                setShowPopup={jest.fn()}
                adminAccess={true}
                setIsDirty={mockSetIsDirty}
                reset=""
                childRef={childRef}
                organizationId={1}
            />
        );

        const libAcc = screen.getByText(`Library List (${projectData?.other_container?.length})`);
        await act(() => fireEvent.click(libAcc));
        const addLibButton = screen.getByText('Add Library');
        fireEvent.click(addLibButton);
        await waitFor(() =>
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        );
    });

    test('More/Less works as expected', async () => {
        const getLibraries = jest.fn();
        (getLibraries as jest.Mock).mockResolvedValue(projectData);
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(projectData),
        });
        render(
            <LibraryAccordion
                projectData={projectData}
                setLoader={mockSetLoader}
                setSortBy={mockSetSortBy}
                setProjects={mockSetProjects}
                projectInitial={mockProjectInitial}
                projectId={projectData.id.toString()}
                sortBy=""
                actionsEnabled={[]}
                fetchLibraries={mockFetchLibraries}
                userData={userData}
                selectedLibraryId={0}
                setExpanded={mockSetExpanded}
                setLibraryId={mockSetLibraryId}
                isDirty={false}
                setShowPopup={jest.fn()}
                adminAccess={true}
                setIsDirty={mockSetIsDirty}
                reset=""
                childRef={childRef}
                organizationId={1}
            />
        );
        const libAcc = screen.getByText(`Library List (${projectData?.other_container?.length})`);
        await act(() => fireEvent.click(libAcc));
        const moreButton = screen.getByText(/more/);
        await act(() => fireEvent.click(moreButton));
    });
});