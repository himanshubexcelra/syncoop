/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import SendMoleculesForSynthesis from '../SendMoleculesForSynthesis';
import { MoleculeOrder, MoleculeStatusLabel } from '@/lib/definition';
import DataGrid, { Column } from 'devextreme-react/data-grid';
import { Button } from "devextreme-react/button";
import Image from 'next/image';

const moleculeData = [
    {
        id: '1212121',
        smiles_string: 'CC(=O)Oc1ccccc1C(=O)O',
        order_id: 101,
        molecule_id: 2001,
        molecular_weight: 250,
        status: 1,
        yield: 1,
        anlayse: 0.7,
        herg: 1,
        caco2: 0.5,
        library_id: 4,
        project_id: 3,
        organization_id: 2,
        molecule_status: MoleculeStatusLabel.New,
        order_status: 'In Progress',
        adme_data: [],
        functional_assays: [],
        reaction_data: null,
        organizationMetadata: null,
        projectMetadata: { target: 100, type: "Retrosynthesis" }
    },
];

const inRetroData: MoleculeOrder[] = [];

const generateReactionPathway = jest.fn();
const setSynthesisView = jest.fn();
const setDisableAnalysis = jest.fn();
const handleStructureZoom = jest.fn();
const closeMagnifyPopup = jest.fn();
const removeSynthesisData = jest.fn();

describe('Send Molecules For Synthesis should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    test(`Send Molecules For Synthesis should show not count of molecules
     in retro when none are there
    and count of molecules to be sent for retro`, async () => {

        await act(async () => {
            render(
                <SendMoleculesForSynthesis
                    moleculeData={moleculeData}
                    inRetroData={inRetroData}
                    generateReactionPathway={generateReactionPathway}
                    setSynthesisView={setSynthesisView}
                    setDisableAnalysis={setDisableAnalysis}
                    handleStructureZoom={handleStructureZoom}
                    closeMagnifyPopup={closeMagnifyPopup}
                    removeSynthesisData={removeSynthesisData}
                />);
        });


        const divElement = screen.queryByText(`0 of your selected molecules have already
        been sent for retrosynthesis`);
        expect(divElement).not.toBeInTheDocument();

        const divElement2 = screen.queryByText(`1 molecules will be sent for retrosynthesis.`);
        expect(divElement2).toBeInTheDocument();
    });

    test('Check if data is present', async () => {
        await act(async () => {
            render(
                <SendMoleculesForSynthesis
                    moleculeData={moleculeData}
                    inRetroData={moleculeData}
                    generateReactionPathway={generateReactionPathway}
                    setSynthesisView={setSynthesisView}
                    setDisableAnalysis={setDisableAnalysis}
                    handleStructureZoom={handleStructureZoom}
                    closeMagnifyPopup={closeMagnifyPopup}
                    removeSynthesisData={removeSynthesisData}
                />);
        });

        await waitFor(() => {
            expect(screen.queryAllByText(/Molecule ID/i).length).toBeGreaterThan(0);
        });
    });

    test('confirm button should work as expected', async () => {
        await act(async () => {
            render(
                <SendMoleculesForSynthesis
                    moleculeData={moleculeData}
                    inRetroData={moleculeData}
                    generateReactionPathway={generateReactionPathway}
                    setSynthesisView={setSynthesisView}
                    setDisableAnalysis={setDisableAnalysis}
                    handleStructureZoom={handleStructureZoom}
                    closeMagnifyPopup={closeMagnifyPopup}
                    removeSynthesisData={removeSynthesisData}
                />);
        });

        const confirmButton = screen.getByText('Confirm');
        expect(confirmButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(confirmButton) });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('Remove Synthesis should work as expected', async () => {
        await act(async () => {
            render(
                <SendMoleculesForSynthesis
                    moleculeData={moleculeData}
                    inRetroData={moleculeData}
                    generateReactionPathway={generateReactionPathway}
                    setSynthesisView={setSynthesisView}
                    setDisableAnalysis={setDisableAnalysis}
                    handleStructureZoom={handleStructureZoom}
                    closeMagnifyPopup={closeMagnifyPopup}
                    removeSynthesisData={removeSynthesisData}
                />);
        });

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(cancelButton) });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    test.skip('cancel button should work as expected', async () => {
        await act(async () => {
            render(
                <DataGrid
                    dataSource={moleculeData}
                    showBorders={true}
                    columnAutoWidth={false}
                    width="100%"
                >
                    <Column dataField="molecule_id" caption="Molecule ID" alignment="center" />
                    <Column cellRender={({ data }) => (
                        <Button
                            onClick={() => removeSynthesisData(data)}
                            render={() => (
                                <Image src="/icons/delete.svg"
                                    width={24}
                                    height={24}
                                    alt="Delete Molecule" />
                            )}
                        />
                    )} caption="Remove" />
                </DataGrid>
            );


        });

        const deleteButtons = screen.getByAltText('Delete Molecule');
        fireEvent.click(deleteButtons);

        await waitFor(() => {
            expect(removeSynthesisData).toHaveBeenCalledWith(moleculeData[0]);
        });
    });
});