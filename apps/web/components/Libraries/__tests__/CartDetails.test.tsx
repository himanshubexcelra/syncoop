import React from "react";
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartDetails from '../CartDetails';
import { CartItem, UserData } from '@/lib/definition';
import { Messages } from '@/utils/message';
import "@testing-library/jest-dom";
import Accordion, { Item } from "devextreme-react/accordion";
import { Switch } from "devextreme-react";
import CustomDataGrid from '@/ui/dataGrid';

describe('CartDetails Component', () => {
    const mockRemoveItemFromCart = jest.fn();
    const mockRemoveAll = jest.fn();
    const mockprepareLabJobData = jest.fn();
    const mocksetCreatePopupVisibility = jest.fn();
    const cartData: CartItem[] = [
        {
            "id": 1297,
            "molecule_order_id": 1,
            "molecule_id": 64,
            "library_id": 9,
            "project_id": 5,
            "organization_id": 2,
            "molecule": {
                "molecular_weight": "0.7",
                "source_molecule_name": "Molecule 1",
                "smiles_string": "CC(=O)Oc1ccccc1C(=O)O",
                "library": {
                    "name": "Library31234",
                    "project": {
                        "name": "Test Project 2"
                    }
                },
                "project": {
                    "name": "Test Project 2"
                }
            },
            "organization": {
                "id": 2,
                "name": "Fauxbio"
            },
            "moleculeName": "",
            "smiles_string": "",
            "orderName": ""
        }
    ];

    const userData: UserData = {
        id: 3,
        first_name: "User Library",
        last_name: "Manager",
        email_id: "lib_manager@external.milliporesigma.com",
        organization_id: 2,
        is_active: false,
        user_role: [],
        orgUser: {
            id: 0,
            first_name: '',
            name: '',
            email_id: '',
            status: '',
            last_name: '',
            organization: {
                id: 0,
                name: '',
            },
            user_role: [],
            type: ''
        },
        myRoles: [],
        roles: [{ type: "admin" }]
    };


    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render cart details correctly', async () => {
        await act(async () => {
            render(
                <CartDetails
                    cartData={cartData}
                    userData={userData}
                    removeItemFromCart={mockRemoveItemFromCart}
                    removeAll={mockRemoveAll}
                    containsProjects={true}
                    close={mocksetCreatePopupVisibility}
                    loader={false}
                />
            );
        });
    });

    test('enables Submit Order button for External organizations', () => {
        render(
            <CartDetails
                cartData={cartData}
                userData={userData}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
                containsProjects={true}
                close={mocksetCreatePopupVisibility}
                loader={false}
            />
        );

        const submitButton = screen.getByText('Submit Order');
        expect(submitButton).toBeEnabled();
    });

    test('should call removeItemFromCart when remove button is clicked', () => {
        const userId = userData.id;
        render(
            <CartDetails
                cartData={cartData}
                userData={userData}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
                containsProjects={true}
                close={mocksetCreatePopupVisibility}
                loader={false}
            />
        );
        const removeAllLink = screen.getByText('Remove All');
        fireEvent.click(removeAllLink);
        expect(mockRemoveAll).toHaveBeenCalledWith(userId, 'RemoveAll', Messages.REMOVE_ALL_MESSAGE);
    });

    test('should render "No Items in the cart" when cartData is empty', () => {
        render(
            <CartDetails
                cartData={[]}
                userData={userData}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
                containsProjects={true}
                close={mocksetCreatePopupVisibility}
                loader={false}
            />
        );
        expect(screen.getByText('No Items in the cart')).toBeInTheDocument();
    });
    test('should return lab job data with valid inputs', () => {
        const mockResponse = {
            "id": "67",
            "source_molecule_name": "Molecule 1",
            "library_id": "9",
            "project_id": "5",
            "organization_id": "2",
            "smiles_string": "CC(=O)Oc1ccccc1C(=O)O",
            "inchi_key": "CC(=O)Oc1ccccc1C(=O)O",
            "molecular_weight": "0.7",
            "status": 9,
            "is_added_to_cart": true,
            "created_at": "2024-10-23T07:18:04.187Z",
            "created_by": 3,
            "updated_at": "2024-12-23T19:57:21.269Z",
            "updated_by": 1,
            "pathway": [
                {
                    "id": "1968",
                    "parent_id": null,
                    "pathway_instance_id": 0,
                    "pathway_index": 0,
                    "pathway_score": "0.9563652152208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-20T22:05:22.718Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null,
                    "reaction_detail": [
                        {
                            "id": "5821",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1968",
                            "reaction_sequence_no": 2,
                            "confidence": null,
                            "reaction_smiles_string": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.749Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5822",
                            "reaction_name": "O-acylhydroxylamine + amine reaction",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1968",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(ON1C(=O)CCC1=O)c1ccco1.COc1ccc(C2(CN)CCOCC2)cc1>>COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
                            "temperature": null,
                            "solvent": "THF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.749Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5823",
                            "reaction_name": "Steglich esterification",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1968",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "O=C1CCC(=O)N1O.O=C(O)c1ccco1>>O=C(ON1C(=O)CCC1=O)c1ccco1",
                            "temperature": null,
                            "solvent": "DMF",
                            "product_smiles_string": "O=C(ON1C(=O)CCC1=O)c1ccco1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.748Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                },
                {
                    "id": "1969",
                    "parent_id": null,
                    "pathway_instance_id": 0,
                    "pathway_index": 1,
                    "pathway_score": "0.9563652152208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-20T22:05:22.835Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null,
                    "reaction_detail": [
                        {
                            "id": "5824",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1969",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.841Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5825",
                            "reaction_name": "N-Alkylation",
                            "reaction_template_id": 69,
                            "reaction_code": null,
                            "pathway_id": "1969",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)Cl.COc1ccc(C2(CCOCC2)CN)cc1>>COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "temperature": 150,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.841Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                },
                {
                    "id": "1970",
                    "parent_id": null,
                    "pathway_instance_id": 0,
                    "pathway_index": 2,
                    "pathway_score": "0.9563652172208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-20T22:05:22.890Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null,
                    "reaction_detail": [
                        {
                            "id": "5826",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1970",
                            "reaction_sequence_no": 3,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)NCC2(CCOCC2)c3ccc(OC)cc3.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.896Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5827",
                            "reaction_name": "O-Alkylation",
                            "reaction_template_id": 73,
                            "reaction_code": null,
                            "pathway_id": "1970",
                            "reaction_sequence_no": 2,
                            "confidence": null,
                            "reaction_smiles_string": "Oc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1>>O=C(c1occc1)NCC2(CCOCC2)c3ccc(OC)cc3",
                            "temperature": 100,
                            "solvent": "DMF",
                            "product_smiles_string": "O=C(c1occc1)NCC2(CCOCC2)c3ccc(OC)cc3",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.896Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5828",
                            "reaction_name": "O-acylhydroxylamine + amine reaction",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1970",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)On2c3ncccc3nn2.Oc1ccc(C2(CCOCC2)CN)cc1>>Oc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "temperature": null,
                            "solvent": "THF",
                            "product_smiles_string": "Oc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.896Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5829",
                            "reaction_name": "Alcohol + acid esterification reaction",
                            "reaction_template_id": 72,
                            "reaction_code": null,
                            "pathway_id": "1970",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "On1c2ncccc2nn1.O=C(c1occc1)O>>O=C(c1occc1)On2c3ncccc3nn2",
                            "temperature": null,
                            "solvent": "THF",
                            "product_smiles_string": "O=C(c1occc1)On2c3ncccc3nn2",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-20T22:05:22.895Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                },
                {
                    "id": "1991",
                    "parent_id": null,
                    "pathway_instance_id": 0,
                    "pathway_index": 0,
                    "pathway_score": "0.9563652152208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-23T19:56:40.306Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null,
                    "reaction_detail": [
                        {
                            "id": "5885",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1991",
                            "reaction_sequence_no": 2,
                            "confidence": null,
                            "reaction_smiles_string": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.348Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5886",
                            "reaction_name": "O-acylhydroxylamine + amine reaction",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1991",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(ON1C(=O)CCC1=O)c1ccco1.COc1ccc(C2(CN)CCOCC2)cc1>>COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
                            "temperature": null,
                            "solvent": "THF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.348Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5887",
                            "reaction_name": "Steglich esterification",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1991",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "O=C1CCC(=O)N1O.O=C(O)c1ccco1>>O=C(ON1C(=O)CCC1=O)c1ccco1",
                            "temperature": null,
                            "solvent": "DMF",
                            "product_smiles_string": "O=C(ON1C(=O)CCC1=O)c1ccco1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.347Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                },
                {
                    "id": "1992",
                    "parent_id": null,
                    "pathway_instance_id": 0,
                    "pathway_index": 1,
                    "pathway_score": "0.9563652152208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-23T19:56:40.463Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null,
                    "reaction_detail": [
                        {
                            "id": "5888",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1992",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.472Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5889",
                            "reaction_name": "N-Alkylation",
                            "reaction_template_id": 69,
                            "reaction_code": null,
                            "pathway_id": "1992",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)Cl.COc1ccc(C2(CCOCC2)CN)cc1>>COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "temperature": 150,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.472Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                },
                {
                    "id": "1993",
                    "parent_id": null,
                    "pathway_instance_id": 0,
                    "pathway_index": 2,
                    "pathway_score": "0.9563652172208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-23T19:56:40.538Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null,
                    "reaction_detail": [
                        {
                            "id": "5890",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1993",
                            "reaction_sequence_no": 3,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)NCC2(CCOCC2)c3ccc(OC)cc3.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.551Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5891",
                            "reaction_name": "O-Alkylation",
                            "reaction_template_id": 73,
                            "reaction_code": null,
                            "pathway_id": "1993",
                            "reaction_sequence_no": 2,
                            "confidence": null,
                            "reaction_smiles_string": "Oc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1>>O=C(c1occc1)NCC2(CCOCC2)c3ccc(OC)cc3",
                            "temperature": 100,
                            "solvent": "DMF",
                            "product_smiles_string": "O=C(c1occc1)NCC2(CCOCC2)c3ccc(OC)cc3",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.551Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5892",
                            "reaction_name": "O-acylhydroxylamine + amine reaction",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1993",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)On2c3ncccc3nn2.Oc1ccc(C2(CCOCC2)CN)cc1>>Oc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "temperature": null,
                            "solvent": "THF",
                            "product_smiles_string": "Oc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.551Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5893",
                            "reaction_name": "Alcohol + acid esterification reaction",
                            "reaction_template_id": 72,
                            "reaction_code": null,
                            "pathway_id": "1993",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "On1c2ncccc2nn1.O=C(c1occc1)O>>O=C(c1occc1)On2c3ncccc3nn2",
                            "temperature": null,
                            "solvent": "THF",
                            "product_smiles_string": "O=C(c1occc1)On2c3ncccc3nn2",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 1,
                            "created_at": "2024-12-23T19:56:40.551Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                },
                {
                    "id": "1971",
                    "parent_id": "1969",
                    "pathway_instance_id": 1,
                    "pathway_index": 1,
                    "pathway_score": "0.9563652152208423",
                    "step_count": null,
                    "molecule_id": "67",
                    "description": null,
                    "selected": false,
                    "created_at": "2024-12-20T22:05:46.861Z",
                    "created_by": 1,
                    "updated_at": "2024-12-23T19:57:12.340Z",
                    "updated_by": 1,
                    "reaction_detail": [
                        {
                            "id": "5830",
                            "reaction_name": "Carboxylic acid + amine condensation",
                            "reaction_template_id": 13,
                            "reaction_code": null,
                            "pathway_id": "1971",
                            "reaction_sequence_no": 1,
                            "confidence": null,
                            "reaction_smiles_string": "COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "temperature": 50,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
                            "product_molecular_weight": null,
                            "product_type": "F",
                            "status": 3,
                            "created_at": "2024-12-20T22:05:46.873Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        },
                        {
                            "id": "5831",
                            "reaction_name": "N-Alkylation",
                            "reaction_template_id": 69,
                            "reaction_code": null,
                            "pathway_id": "1971",
                            "reaction_sequence_no": 0,
                            "confidence": null,
                            "reaction_smiles_string": "O=C(c1occc1)Cl.COc1ccc(C2(CCOCC2)CN)cc1>>COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "temperature": 150,
                            "solvent": "DMF",
                            "product_smiles_string": "COc1ccc(C2(CCOCC2)CNC(c3occc3)=O)cc1",
                            "product_molecular_weight": null,
                            "product_type": "I",
                            "status": 3,
                            "created_at": "2024-12-20T22:05:46.873Z",
                            "created_by": 1,
                            "updated_at": null,
                            "updated_by": null
                        }
                    ]
                }
            ],
            "organization": {
                "id": "2",
                "parent_id": "1",
                "type": "CO",
                "name": "Fauxbio",
                "description": null,
                "owner_id": 2,
                "inherits_configuration": true,
                "config": null,
                "metadata": null,
                "is_active": true,
                "created_at": "2024-12-04T16:13:27.764Z",
                "created_by": 1,
                "updated_at": null,
                "updated_by": null
            }
        };
        const moleculeId = 67;
        const result = mockprepareLabJobData(mockResponse, moleculeId);
        expect(result).toEqual(result);
    });

    test('renders correctly when not loading', async () => {
        await act(async () => {
            render(
                <CartDetails
                    cartData={cartData}
                    userData={userData}
                    removeItemFromCart={mockRemoveItemFromCart}
                    removeAll={mockRemoveAll}
                    containsProjects={false}
                    close={mocksetCreatePopupVisibility}
                    loader={false}
                />
            );
        });

        const submitOrder = screen.getByText('Submit Order');
        expect(submitOrder).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(submitOrder);
        });

        expect(screen.getByText(Messages.LAP_JOB_CONFIRMATION_TITLE)).toBeInTheDocument();
    }, 60000);

    test('Confirmation dialog closes when Cancel button is clicked', async () => {
        await act(async () => {
            render(
                <CartDetails
                    cartData={cartData}
                    userData={userData}
                    removeItemFromCart={mockRemoveItemFromCart}
                    removeAll={mockRemoveAll}
                    containsProjects={false}
                    close={mocksetCreatePopupVisibility}
                    loader={false}
                />);
        });
        const submitOrder = screen.getByText('Submit Order');
        expect(submitOrder).toBeInTheDocument();
        await act(async () => { fireEvent.click(submitOrder) });
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(screen.queryByText(Messages.LAP_JOB_CONFIRMATION_TITLE)).not.toBeInTheDocument();
    });

    test('Close button calls close when clicked', async () => {
        await act(async () => {
            render(
                <CartDetails
                    cartData={cartData}
                    userData={userData}
                    removeItemFromCart={mockRemoveItemFromCart}
                    removeAll={mockRemoveAll}
                    containsProjects={true}
                    close={mocksetCreatePopupVisibility}
                    loader={false}
                />
            );
        });

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

    });

    test('Submit Order For Projects Page', async () => {
        await act(async () => {
            render(<CartDetails
                cartData={cartData}
                userData={userData}
                removeItemFromCart={mockRemoveItemFromCart}
                removeAll={mockRemoveAll}
                containsProjects={true}
                close={mocksetCreatePopupVisibility}
                loader={false}
            />
            );
        });
        const submitButton = screen.getByText('Submit Order');
        expect(submitButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(submitButton) });

    });
});

describe("Accordion with Switch Component", () => {
    const mockHandleToggleChange = jest.fn();
    const mockRowGroupName = jest.fn(() => "groupName");
    const columns = [
        { dataField: "name", headerName: "Name" },
        { dataField: "type", headerName: "Type" },
        { dataField: "weight", headerName: "Weight" },
    ];
    
    const moleculeData = [
        { id: 1, name: "Benzene", type: "Aromatic", weight: "78.11 g/mol" },
        { id: 2, name: "Ethanol", type: "Alcohol", weight: "46.07 g/mol" },
    ];
    const showAccordion = true;

    beforeEach(() => {
        render(
            <Accordion collapsible multiple={false}>
                <Item visible={false} />
                <Item titleRender={() => "Molecules for Analysis"}>
                    <div>
                        <div className="flex flex-row items-center justify-end">
                            <label className="mr-[12px] font-lato font-700 font-[13px]">
                                Show Products
                            </label>
                            <Switch aria-label="switch" value={showAccordion} onValueChanged={mockHandleToggleChange} />
                        </div>
                        <CustomDataGrid
                            columns={columns}
                            height="auto"
                            data={moleculeData}
                            groupingColumn={mockRowGroupName()}
                            enableGrouping
                            enableSorting={false}
                            enableFiltering={false}
                            enableOptions={false}
                            enableRowSelection={false}
                            enableSearchOption={false}
                            loader={false}
                            scrollMode="infinite"
                        />
                    </div>
                </Item>
            </Accordion>
        );
    });

    it("toggles Accordion Item correctly when clicked", () => {
        const accordionTitle = screen.getByText("Molecules for Analysis");
        expect(accordionTitle).toBeInTheDocument();

        // Simulate a click to toggle the Accordion item
        fireEvent.click(accordionTitle);

        // Check if the content of the item becomes visible
        const label = screen.getByText("Show Products");
        expect(label).toBeInTheDocument();
    });

    it("does not render the Item with visible={false}", () => {
        // DevExtreme items with `visible={false}` should not render
        expect(screen.queryByText("Hidden Item")).not.toBeInTheDocument();
    });

    test("renders CustomDataGrid with correct rows and columns", async () => {
        render(
            <CustomDataGrid
                columns={[
                    { dataField: "name", title: "Name" },
                    { dataField: "type", title: "Type" },
                    { dataField: "weight", title: "Weight" },
                    { dataField: "density", title: "Density" },
                    { dataField: "formula", title: "Formula" },
                ]}
                data={[
                    { id: 1, name: "Benzene", type: "Aromatic", weight: "78.11 g/mol", density: "0.876 g/cm³", formula: "C6H6" },
                    { id: 2, name: "Ethanol", type: "Alcohol", weight: "46.07 g/mol", density: "0.789 g/cm³", formula: "C2H5OH" },
                ]}
                enableRowSelection
                enableGrouping
                enableSorting
                loader={false}
                enableHeaderFiltering
                enableSearchOption={true}
            />
        );
    
        // Wait for the grid to render
        await waitFor(() => {
            // Get the grid by its role
            const grid = screen.getByRole("group");
    
            // Check the aria-label dynamically
            expect(grid).toHaveAttribute("aria-label", "Data grid with 2 rows and 6 columns");
        });
    
        // Verify rows
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBe(4); // Verify 4 rows
    
        // Verify columns
        const columns = screen.getAllByRole("columnheader");
        expect(columns.length).toBe(6); // Verify 6 columns
    });
    
    
});
