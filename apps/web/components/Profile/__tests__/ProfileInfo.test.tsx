import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import ProfileInfo from '../ProfileInfo';
import { getUsersById } from '../service';

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
        roleType: 'admin',
        isMyProfile: true,
    };

    const mockUserData = [
        {
            email: 'test@example.com',
            firstName: 'Apoorv',
            lastName: 'Mehrotra',
            orgUser: { name: 'FauxBio' },
            user_role: [{ role: { name: 'Admin' } }],
            status: 'Enabled',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (getUsersById as jest.Mock).mockResolvedValue(mockUserData);
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
        expect(screen.getByText('Email:')).toBeInTheDocument();
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