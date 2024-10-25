"use client"
import styled from '@emotion/styled';

import { PanelButton } from './shared/Buttons';

import { InputSelect } from './InputSelect';
import { Highlighting } from './Highlighting';
import { ButtonsSelect } from './ButtonsSelect';
import { FileInputForm } from './FileInputForm';
import { ControlsCard } from './ControlsCard';
import getAPIData from './service';

const FlexBox = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 10px;
`;

const clearSelection = () => KetcherFunctions.clearSelection();

const selectAll = () => KetcherFunctions.selectAll();

interface Props {
  printToTerminal: (arg: string) => void;
  hiddenButtons: string[];
  buttonsHideHandler: (arg: string[]) => void;
}

export const Panel = ({
  printToTerminal,
  hiddenButtons,
  buttonsHideHandler,
}: Props) => {
  const exportHandler = () => {
    KetcherFunctions.exportCtab().then((str) => {
      const message = 'Export content:' + str;
      printToTerminal(message);
    });
  };

  const showAtomIds = () => {
    const atoms = KetcherFunctions.getSelectedAtomId();

    if (!atoms) {
      printToTerminal('No atoms selected');
    } else {
      printToTerminal('Selected atoms: ' + atoms);
    }
  };

  const getStructure = async () => {
    KetcherFunctions.exportCtab().then((str) => {
      const message = 'Export content:' + str;
      console.log(message);
      printToTerminal(message);
    });

    const url = process.env.NEXT_PUBLIC_INDIGO_SERVICE_API!;
    const response = await getAPIData(url);
    return (response as any).data;
  };

  return (
    <FlexBox>
      <ControlsCard cardName="Selection">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <PanelButton
            size="small"
            variant="contained"
            onClick={selectAll}
            sx={{ width: '120px' }}
          >
            Select all
          </PanelButton>
          <PanelButton
            size="small"
            variant="outlined"
            onClick={clearSelection}
            sx={{ width: '120px' }}
          >
            Clear
          </PanelButton>
        </div>
        <PanelButton size="small" onClick={showAtomIds} variant="contained">
          Get Selected Atom ID
        </PanelButton>

        <InputSelect />
      </ControlsCard>

      <ControlsCard cardName="Highlighting">
        <Highlighting printToTerminal={printToTerminal} />
      </ControlsCard>

      <ControlsCard cardName="Render Reaction">
        <ButtonsSelect
          hiddenButtons={hiddenButtons}
          setHiddenButtons={buttonsHideHandler}
        />
      </ControlsCard>

      <ControlsCard cardName="Import File">
        <FileInputForm printToTerminal={printToTerminal} />
      </ControlsCard>
      <ControlsCard cardName="Export">
        <PanelButton
          onClick={exportHandler}
          variant="contained"
          size="small"
          style={{ marginTop: '15px', marginBottom: '15px' }}
        >
          Export as MDL Molfile V2000
        </PanelButton>
      </ControlsCard>

      <input type="button" onClick={getStructure} value="" />
      <PanelButton
        onClick={getStructure}
        variant="contained"
        size="small"
        style={{ marginTop: '15px', marginBottom: '15px' }}
      >
        Get Structure
      </PanelButton>

    </FlexBox>
  );
};
