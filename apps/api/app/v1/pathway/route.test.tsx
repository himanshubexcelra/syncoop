import { prismaMock } from "@/singleton"
import { GET, POST, PUT } from "./route"
import { getUTCTime } from "@/utils/helper";
jest.mock('@/lib/prisma', () => ({
    pathway: {
        update: jest.fn(),
    },
    reaction_detail: {
        update: jest.fn(),
    },
    reaction_compound: {
        update: jest.fn(),
    },
}));
jest.mock('@/utils/helper', () => ({
    getUTCTime: jest.fn().mockReturnValue('2025-01-13T13:24:45.102Z'),
    json: jest.fn(),
}));

jest.mock('@/utils/message', () => ({
    STATUS_TYPE: {
        SUCCESS: 200,
        BAD_REQUEST: 400,
    },
}));

describe('route/pathway', () => {
    test('GET /pathway should return pathways for given molecule_id', async () => {
        const mockPathwayData: any = [
            {
                id: 1,
                pathway_index: 1,
                molecule_id: 123,
                pathway_instance_id: 1,
                updated_at: '2025-01-13T13:24:45.102Z',
                created_at: '2025-01-13T13:00:00.000Z',
                created_by: 'user123',
                updated_by: 'user123',
                description: 'Test Pathway',
                selected: true,
                pathway_score: 90,
                reaction_detail: [
                    {
                        id: 101,
                        reaction_sequence_no: 1,
                        reaction_name: 'Test Reaction',
                        reaction_smiles_string: 'CCO',
                        product_smiles_string: 'CCO',
                        temperature: 25,
                        solvent: 'Water',
                        confidence: 90,
                        status: 1,
                        created_at: '2025-01-13T13:00:00.000Z',
                        reaction_compound: [
                            {
                                id: 1001,
                                compound_label: 'A',
                                compound_id: 'comp1',
                                compound_name: 'Compound A',
                                molar_ratio: 1,
                                dispense_time: 10,
                                smiles_string: 'C1CC1',
                                compound_type: 'Solid',
                                role: 'Reactant',
                                created_at: '2025-01-13T13:00:00.000Z',
                            },
                        ],
                        reaction_template_master: {
                            reaction_template: {
                                reaction_type: 'Suzuki',
                            },
                        },
                    },
                ],
            },
        ];
        prismaMock.pathway.findMany.mockResolvedValue(mockPathwayData);
        const request = new Request('http://localhost/?molecule_id=123', {
            method: 'GET',
        });
        const response = await GET(request);
        expect(prismaMock.pathway.findMany).toHaveBeenCalledWith({
            distinct: ['pathway_index'],
            orderBy: [
                { pathway_instance_id: 'desc' },
                { updated_at: 'desc' },
            ],
            where: { molecule_id: 123 },
            include: {
                reaction_detail: {
                    orderBy: { reaction_sequence_no: 'asc' },
                    include: {
                        reaction_compound: {
                            orderBy: { compound_label: 'asc' },
                        },
                        reaction_template_master: {
                            select: { reaction_template: true },
                        },
                    },
                },
            },
        });

        expect(response.status).toBe(200);
    });
    test('SAVE/pathway create new pathways and reactions', async () => {
        const mockRequestBody = [
            {
                id: 1234,
                molecule_id: 123,
                pathway_instance_id: 1,
                pathway_index: 2,
                description: 'Test Pathway',
                selected: true,
                created_by: 'user123',
                updated_by: 'user123',
                reaction_detail: [
                    {
                        reaction_name: 'Test Reaction',
                        reaction_sequence_no: 1,
                        reaction_smiles_string: 'CCO',
                        confidence: 90,
                        temperature: 25,
                        solvent: 'Water',
                        product_smiles_string: 'CCO',
                        product_type: 'Type 1',
                        status: 1,
                        created_at: getUTCTime(new Date().toISOString()),
                        parent_id: 32,
                        pathway_score: 1,
                        step_count: 2,
                        reaction_compound: [
                            {
                                compound_id: '1',
                                compound_name: 'Compound 1',
                                molar_ratio: 1,
                                dispense_time: 10,
                                smiles_string: 'C1CC1',
                                compound_type: 'Solid',
                                compound_label: 'Compound A',
                                role: 'Reactant',
                            },
                        ],
                    },
                ],
            },
        ];
        prismaMock.pathway.create.mockResolvedValue(mockRequestBody[0]);
        prismaMock.reaction_template_master.findUnique.mockResolvedValue({ id: 1 });
        const request = new Request('http://localhost/', {
            method: 'POST',
            body: JSON.stringify(mockRequestBody),
        });
        const response = await POST(request);
        expect(prismaMock.pathway.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.pathway.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    molecule_id: 123,
                    pathway_instance_id: 1,
                    pathway_index: 2,
                }),
            })
        );
        expect(response.status).toBe(200);
    });
    test('PUT/pathway should update pathway, reaction details, and reaction compounds correctly', async () => {
        const mockRequestBody = {
            data: {
                "id": 154,
                "temperature": 70,
                "solvent": "THF",
                "status": 2,
                "created_by": 5,
                "pathwayId": 52
            },
            molecules: [
                { id: 1, compound_id: '1', compound_name: 'Updated Compound', molar_ratio: 2 },
            ],
        };
        prismaMock.pathway.update.mockResolvedValue({ id: 52 });
        prismaMock.reaction_detail.update.mockResolvedValue({ id: 154 });
        prismaMock.reaction_compound.update.mockResolvedValue({ id: 1 });

        const request = new Request('http://localhost/', {
            method: 'PUT',
            body: JSON.stringify(mockRequestBody),
        });

        const response = await PUT(request);
        expect(prismaMock.pathway.update).toHaveBeenCalledWith({
            where: { id: 52 },
            data: {
                updated_at: expect.any(String),
                updated_by: 5,
            },
        });

        expect(prismaMock.reaction_detail.update).toHaveBeenCalledWith({
            where: { id: 154 },
            data: {
                id: 154,
                temperature: 70,
                solvent: 'THF',
                status: 2,
                created_by: 5,
            },
        });

        expect(prismaMock.reaction_compound.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                id: 1,
                compound_id: '1',
                compound_name: 'Updated Compound',
                molar_ratio: 2,
            },
        });
        expect(response.status).toBe(200);
    });

})