import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ConfirmationDialog from '../ConfirmationDialog';  // Adjust the import path as necessary

describe('ConfirmationDialog', () => {
  const onSaveMock = jest.fn();
  const setConfirmMock = jest.fn();
  test('renders the confirmation dialog with correct message and title', async () => {

    await act(async () => {
      render(
        <ConfirmationDialog
          onSave={onSaveMock}
          openConfirmation={true}
          setConfirm={setConfirmMock}
          msg="Are you sure you want to proceed?"
          title="Confirmation"
        />
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Confirmation')).toBeInTheDocument();
    })
    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    })
    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    })
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    })
  });

  test('calls onSave when the Confirm button is clicked', async () => {
    render(
      <ConfirmationDialog
        onSave={onSaveMock}
        openConfirmation={true}
        setConfirm={setConfirmMock}
        msg="Are you sure you want to proceed?"
        title="Confirmation"
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Confirm'));
    })
    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledTimes(1);
    })
    await waitFor(() => {
      expect(setConfirmMock).toHaveBeenCalledWith(false);
    })
  });

  test('closes the dialog when the Cancel button is clicked', async () => {
    render(
      <ConfirmationDialog
        onSave={onSaveMock}
        openConfirmation={true}
        setConfirm={setConfirmMock}
        msg="Are you sure you want to proceed?"
        title="Confirmation"
      />
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel'));
    })
    await waitFor(() => {
      expect(setConfirmMock).toHaveBeenCalledWith(false);
    })
  });

  test('dialog visibility is updated when openConfirmation prop changes', async () => {
    const { rerender } = render(
      <ConfirmationDialog
        onSave={onSaveMock}
        openConfirmation={true}
        setConfirm={setConfirmMock}
        msg="Are you sure you want to proceed?"
        title="Confirmation"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Confirmation')).toBeInTheDocument();

    })
    rerender(
      <ConfirmationDialog
        onSave={onSaveMock}
        openConfirmation={false}
        setConfirm={setConfirmMock}
        msg="Are you sure you want to proceed?"
        title="Confirmation"
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Confirmation')).toBeInTheDocument();
    })
  });

});
