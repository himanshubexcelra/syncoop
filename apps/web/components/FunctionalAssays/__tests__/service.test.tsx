/*eslint max-len: ["error", { "code": 100 }]*/
import { getBioAssays } from '../service';

describe('Bioassay API Functions', () => {
    const data = [{
        "assay": "EGFR Kinase Assay Kit",
        "clinical_indication": "Non-small cell lung cancer",
        "target": "EGFR",
        "description": "Measures the activity of EGFR kinase in vitro.",
        "user_fields": {
            "sampleType": "Cell lysate",
            "concentration": "10 µg/mL",
            "incubationTime": "30 minutes",
            "specificInhibitors": "Erlotinib"
        },
        name: 'EGFR Kinase Assay Kit',
        supplier: 'BPS Bioscience',
        SKU: 40321,
        testMoleculeName: 'TBD',
        comment: '',
    }, {
        "assay": "EGFR Kinase Assay Kit",
        "clinical_indication": "Non-small cell lung cancer",
        "target": "EGFR",
        "description": "Measures the activity of EGFR kinase in vitro.",
        "user_fields": {
            "sampleType": "Cell lysate",
            "concentration": "10 µg/mL",
            "incubationTime": "30 minutes",
            "specificInhibitors": "Erlotinib"
        },
        name: 'EGFR Kinase Assay Kit',
        supplier: 'BPS Bioscience',
        SKU: 40324,
        testMoleculeName: 'TBD',
        comment: 'dsgfkjsdfg'
    }
    ]

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getBioAssays should fetch library data successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const searchParams = 'eg';
        const distinct = 'target'
        const result = await getBioAssays(searchParams, distinct);
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/functional_assay`);
        url.searchParams.append('searchParams', searchParams);
        url.searchParams.append('distinct', distinct);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(result).toEqual(mockResponse);
    });
});