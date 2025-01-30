/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import AssayFields from '../AssayFields';
import { editOrganization } from '@/components/Organization/service';
import { AppContext } from '../../../app/AppState';
import { AppContextModel } from '@/lib/definition';

const setShowConfirmForm = jest.fn();
const removeAssay = jest.fn();
const fetchOrganizations = jest.fn();
const updateComment = jest.fn();
const mockAppContext = {
    addToState: jest.fn(),
    state: {
        cartDetail: {},
        appContext: {} as AppContextModel,
    },
};

jest.mock('@/components/Organization/service', () => ({
    editOrganization: jest.fn(),
}));

describe('Assay Fields should work as expected', () => {
    test('add assay button should work as expected for new assay', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <AssayFields
                        setShowConfirmForm={
                            setShowConfirmForm}
                        assay={{ name: 'Test', comment: '' }}
                        removeAssay={removeAssay}
                        index={0}
                        fetchOrganizations={fetchOrganizations}
                        updateComment={updateComment}
                        notInherited={true}
                        newForm={true}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('comments');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'New Assay'
                }
            })
        });
        expect(screen.getByText('Yes, Add')).toBeInTheDocument();

        const createButton = screen.getByText('Yes, Add');
        await act(async () => { fireEvent.click(createButton) });
        expect(editOrganization).toHaveBeenCalled();
    });

    test('add assay button should work as expected for commercial assay', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <AssayFields
                        setShowConfirmForm={
                            setShowConfirmForm}
                        assay={{ name: 'Test', commercial: true }}
                        removeAssay={removeAssay}
                        index={0}
                        fetchOrganizations={fetchOrganizations}
                        updateComment={updateComment}
                        notInherited={true}
                        newForm={true}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });

        expect(screen.getByText('Yes, Add')).toBeInTheDocument();

        const createButton = screen.getByText('Yes, Add');
        await act(async () => { fireEvent.click(createButton) });
        expect(editOrganization).toHaveBeenCalled();
    });

    test('cancel adding assay button should work as expected', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <AssayFields
                        setShowConfirmForm={
                            setShowConfirmForm}
                        assay={{ name: 'Test', commercial: true }}
                        removeAssay={removeAssay}
                        index={0}
                        fetchOrganizations={fetchOrganizations}
                        updateComment={updateComment}
                        notInherited={true}
                        newForm={true}
                    />
                </AppContext.Provider>
            );
        });

        expect(screen.getByText('No, Cancel')).toBeInTheDocument();

        const createButton = screen.getByText('No, Cancel');
        await act(async () => { fireEvent.click(createButton) });
        expect(setShowConfirmForm).toHaveBeenCalled();
    });

    test('remove assay button should work as expected', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <AssayFields
                        setShowConfirmForm={
                            setShowConfirmForm}
                        assay={{
                            name: 'Test', commercial: true, user_fields: {
                                "sampleType": "Cell lysate",
                                "concentration": "10 µg/mL",
                                "incubationTime": "30 minutes",
                                "specificInhibitors": "Erlotinib"
                            }
                        }}
                        removeAssay={removeAssay}
                        index={0}
                        fetchOrganizations={fetchOrganizations}
                        updateComment={updateComment}
                        notInherited={true}
                        newForm={false}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });

        expect(screen.getByText('Remove')).toBeInTheDocument();

        const removeButton = screen.getByText('Remove');
        await act(async () => { fireEvent.click(removeButton) });
        expect(editOrganization).toHaveBeenCalled();
    });

    test('add assay button should work as expected for existing assay', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <AssayFields
                        setShowConfirmForm={
                            setShowConfirmForm}
                        assay={{ name: 'Test', comment: '' }}
                        removeAssay={removeAssay}
                        index={0}
                        fetchOrganizations={fetchOrganizations}
                        updateComment={updateComment}
                        notInherited={true}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('comments');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'New Assay'
                }
            })
        });
        expect(updateComment).toHaveBeenCalled();
    });
});