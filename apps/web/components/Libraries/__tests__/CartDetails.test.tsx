import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartDetails from '../CartDetails';
import { OrganizationType, CartItem,  } from '@/lib/definition';


describe('CartDetails Component', () => {
    const mockRemoveItemFromCart = jest.fn();
    const mockRemoveAll = jest.fn();
    const userId = 1;
    const orgType = OrganizationType.External;
    const cartData: CartItem[] = [
        {
            id: 25,
            molecule_id: 3,
            library_id: 2,
            order_id: 27909786,
            moleculeName: 'Molecule 3',
            smiles_string: 'CC(=O)Oc1ccccc1C(=O)O',
            orderName: 'Order27909786',
            organization_id: 2,
            project_id: 1,
            molecule: {
                source_molecule_name: 'Molecule 3',
                molecular_weight: '1',
                smiles_string: 'CC(=O)Oc1ccccc1C(=O)O',
                library: {
                    name: 'Library2',
                    project: { name: 'Project1' },
                },
            },
            organization: { id: 1, name: 'Fauxbio' },
        },
    ];


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render cart details correctly',  async () => {
        await act(async () => {
          render(
            <CartDetails
                cartData={cartData}
                user_id={userId}
                orgType={orgType}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
            />
        );
      });
    });
  
    it('enables Submit Order button for External organizations', () => {
      render(
        <CartDetails
          cartData={cartData}
          user_id={userId}
          orgType={OrganizationType.External}
          removeItemFromCart={mockRemoveItemFromCart}
          removeAll={mockRemoveAll}
        />
      );
  
      const submitButton = screen.getByText('Submit Order');
      expect(submitButton).toBeEnabled();
    });

    it('should call removeAll when Remove All link is clicked', () => {
        render(
            <CartDetails
                cartData={cartData}
                user_id={userId}
                orgType={orgType}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
            />
        );
        const removeAllLink = screen.getByText('Remove All');
        fireEvent.click(removeAllLink);
        expect(mockRemoveAll).toHaveBeenCalledWith(userId, 'RemoveAll');
    });

    it('should render "No Items in the cart" when cartData is empty', () => {
        render(
            <CartDetails
                cartData={[]}
                user_id={userId}
                orgType={orgType}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
            />
        );
        expect(screen.getByText('No Items in the cart')).toBeInTheDocument();
    });
});
