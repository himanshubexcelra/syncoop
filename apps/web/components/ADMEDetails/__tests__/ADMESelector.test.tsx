/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import { editOrganization, getOrganizationById } from '@/components/Organization/service';
import ADMESelector from '../ADMESelector';

const orgUser = {
    id: 24, name: 'org2', type: 'CO'
};

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

    test('Changing slider should work as expected', async () => {
        await act(async () => {
            render(
                <ADMESelector
                    orgUser={orgUser}
                />
            );
        });

        const sliders = screen.getAllByRole('slider');
        expect(sliders.length).not.toBe(0);
        // Here we simulate the slider handle being moved
        fireEvent.mouseDown(sliders[0], { clientX: 10.4 });
        // Simulate mouse move (moving the slider)
        fireEvent.mouseMove(sliders[0], { clientX: 60 });
        fireEvent.mouseUp(sliders[0]);  // Simulate releasing the slider handle
    }, 60000);

    test('save button should work as expected', async () => {
        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        await act(async () => {
            render(
                <ADMESelector
                    orgUser={orgUser}
                />
            );
        });
        const saveButton = screen.getByText('Save');
        expect(saveButton).toBeInTheDocument();
        fireEvent.click(saveButton);
    }, 60000);

    test('save button should work as expected when api returns an error', async () => {
        const mockResponse = { error: 'Unexpected error occured' };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        await act(async () => {
            render(
                <ADMESelector
                    orgUser={orgUser}
                />
            );
        });

        const saveButton = screen.getByText('Save');
        expect(saveButton).toBeInTheDocument();
        await act(() => fireEvent.click(saveButton));
    }, 60000);
});