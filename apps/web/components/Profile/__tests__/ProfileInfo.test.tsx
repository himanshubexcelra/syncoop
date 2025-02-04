import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import ProfileInfo from '../ProfileInfo';
import { getUsersById } from '../service';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../service', () => ({
    getUsersById: jest.fn(),
}));

jest.mock('@/ui/DialogPopUp', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-dialog">Mock Dialog</div>,
}));

describe('ProfileInfo Component', () => {
    const defaultProps = {
        id: 1,
        myRoles: ['admin'],
        isMyProfile: true,
        orgDetailLoggedIn: { name: 'FauxBio', id: 1 },
        actionsEnabled: ['edit_user']
    };

    const mockUserData = [
        {
            email_id: 'test@example.com',
            first_name: 'Apoorv',
            last_name: 'Mehrotra',
            orgUser: { name: 'FauxBio' },
            user_role: [{ role: { name: 'Admin' } }],
            status: 'Enabled',
            is_active: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (getUsersById as jest.Mock).mockResolvedValue(mockUserData);
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('should fetch and display user data correctly', async () => {
        await act(async () => {
            render(<ProfileInfo {...defaultProps} />);
        });

        await waitFor(() => {
            expect(screen.getByText('My Profile')).toBeInTheDocument();
        });

        expect(screen.getByText('Organization:')).toBeInTheDocument();
        expect(screen.getByText('FauxBio')).toBeInTheDocument();
        expect(screen.getByText('Roles:')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('First Name:')).toBeInTheDocument();
        expect(screen.getAllByText('Apoorv')).toHaveLength(2);
        expect(screen.getByText('email_id:')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Last Name:')).toBeInTheDocument();
        expect(screen.getByText('Mehrotra')).toBeInTheDocument();
    });

    it('should render "Change Password" button for personal profile', async () => {
        await act(async () => {
            render(<ProfileInfo {...defaultProps} />);
        });

        expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('should render "Reset Password" button for non-personal profile', async () => {
        await act(async () => {
            render(<ProfileInfo {...defaultProps} isMyProfile={false} />);
        });

        expect(screen.getByText('Reset Password')).toBeInTheDocument();
    });

    it('should open edit form when "Edit" button is clicked', async () => {
        await act(async () => {
            render(<ProfileInfo {...defaultProps} />);
        });

        const editButton = screen.getByText('Edit');
        await act(async () => {
            fireEvent.click(editButton);
        });

        expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    });

    it('should not display status for personal profile', async () => {
        await act(async () => {
            render(<ProfileInfo {...defaultProps} />);
        });

        expect(screen.queryByText('Status:')).not.toBeInTheDocument();
    });

    it('should display status for non-personal profile', async () => {
        await act(async () => {
            render(<ProfileInfo {...defaultProps} isMyProfile={false} />);
        });

        expect(screen.getByText('Status:')).toBeInTheDocument();
        expect(screen.getByText('Enabled')).toBeInTheDocument();
    });
});