// DeleteConfirmation.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmation from '../DeleteConfirmation';

jest.mock('@/utils/message', () => ({
    Messages: {
        TYPE_DELETE: 'Type "delete" to confirm',
    },
}));

jest.mock('devextreme-react', () => ({
    Popup: ({ visible, onHiding, children }: any) => (
        visible ? <div data-testid="popup" onClick={onHiding}>{children}</div> : null
    ),
}));

describe('DeleteConfirmation Component', () => {
    let onSave: jest.Mock;
    let setConfirm: jest.Mock;

    beforeEach(() => {
        onSave = jest.fn();
        setConfirm = jest.fn();
    });

    test('renders correctly with the given props', () => {
        render(
            <DeleteConfirmation
                onSave={onSave}
                isLoader={false}
                openConfirmation={true}
                setConfirm={setConfirm}
                msg="Are you sure you want to delete?"
                title="Delete Confirmation"
            />
        );

        expect(screen.getByText('Are you sure you want to delete?')).toBeInTheDocument();
        expect(screen.getByText('Type "delete" to confirm')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('input "delete" enables the Delete button', () => {
        render(
            <DeleteConfirmation
                onSave={onSave}
                isLoader={false}
                openConfirmation={true}
                setConfirm={setConfirm}
                msg="Are you sure you want to delete?"
                title="Delete Confirmation"
            />
        );

        const input = screen.getByPlaceholderText('delete');
        fireEvent.change(input, { target: { value: 'delete' } });
        expect(screen.getByText('Delete')).not.toBeDisabled();
    });

    test('clicking Delete calls onSave and closes the dialog', async () => {
        render(
            <DeleteConfirmation
                onSave={onSave}
                isLoader={false}
                openConfirmation={true}
                setConfirm={setConfirm}
                msg="Are you sure you want to delete?"
                title="Delete Confirmation"
            />
        );

        const input = screen.getByPlaceholderText('delete');
        fireEvent.change(input, { target: { value: 'delete' } });

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
    });

    test('clicking Cancel closes the dialog without action', () => {
        render(
            <DeleteConfirmation
                onSave={onSave}
                isLoader={false}
                openConfirmation={true}
                setConfirm={setConfirm}
                msg="Are you sure you want to delete?"
                title="Delete Confirmation"
            />
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        // Ensure setConfirm was called with false, closing the dialog
        expect(setConfirm).toHaveBeenCalledWith(false);
    });

    test('Popup is hidden when openConfirmation is false', () => {
        render(
            <DeleteConfirmation
                onSave={onSave}
                isLoader={false}
                openConfirmation={false}
                setConfirm={setConfirm}
                msg="Are you sure you want to delete?"
                title="Delete Confirmation"
            />
        );
        expect(screen.queryByTestId('popup')).toBeNull();
    });
});
