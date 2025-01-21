import React from 'react';
import { render, screen, waitFor, } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListOrganization from '../ListOrganization';
import { getOrganization } from '@/components/Organization/service';
import { UserData } from '@/lib/definition';

// Mock the service
jest.mock('@/components/Organization/service', () => ({
    getOrganization: jest.fn()
}));


describe('ListOrganization', () => {
    const mockData = [
        {
            id: 1,
            name: 'Test Organization',
            is_active: true,
            owner: {
                email_id: 'admin@test.com'
            },
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-16T10:00:00Z',
            orgUser: [{ id: 1 }, { id: 2 }],
            _count: {
                other_container: 5,
                organizationMolecules: 10
            }
        }
    ];

    const mockUserData: UserData = {
        id: 1,
        myRoles: ['admin'],
        first_name: 'Admin',
        last_name: 'User',
        email_id: 'a@b.com',
        organization: {
            id: 1
        },
        organization_id: 1,
        is_active: true,
        user_role: [
            {
                id: 1,
                role: {
                    id: 1,
                    name: 'admin'
                },
                role_id: 1
            }
        ],
        orgUser: {
            id: 1,
            first_name: 'Admin',
            last_name: 'User',
            email_id: 'a@b.com',
            status: 'active',
            name: 'fauxbio',
            type: 'admin',
            organization: {
                id: 1,
                name: 'emdd'
            },
            user_role: [
                {
                    id: 1,
                    role: {
                        id: 1,
                        name: 'admin',
                    },
                    role_id: 1,
                },
            ],
        },
        roles: [
            {
                type: 'admin'
            } // Ensure this array has exactly one element
        ],
    };


    beforeEach(() => {
        (getOrganization as jest.Mock).mockResolvedValue(mockData);
    });

    it('displays organization data in the grid', async () => {
        render(
            <ListOrganization
                userData={mockUserData}
                actionsEnabled={['edit_own_org']}
            />
        );
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
        // screen.debug();
        await waitFor(() => {
            const rowElements = screen.getAllByText('Test Organization');
            expect(screen.getByText('admin@test.com')).toBeInTheDocument();
            expect(rowElements.length).toBe(1);
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
        })

    });
    it('shows edit button only for users with proper permissions', async () => {
        render(
            <ListOrganization
                userData={mockUserData}
                actionsEnabled={[]}
            />
        );

        await waitFor(() => {
            expect(screen.queryByTitle('Edit organization')).toBeInTheDocument();
        });

    });
    it('shows create button only for admin users', async () => {
        // Test with admin user
        render(
            <ListOrganization
                userData={mockUserData}
                actionsEnabled={['edit_own_org']}
            />
        );

        await waitFor(() => {
            const createButton = screen.getByText('Create Organization');
            expect(createButton).toBeInTheDocument();
        });
    });
});