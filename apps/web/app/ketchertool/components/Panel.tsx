import style from "../page.module.css";
import { InputSelect } from "./InputSelect";
import { Highlighting } from "./Highlighting";
import { ButtonsSelect } from "./ButtonsSelect";
import { FileInputForm } from "./FileInputForm";
import { ControlsCard } from "./ControlsCard";
import { Button } from "@mui/material";

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
      const message = "Export content:" + str;
      console.log(message);
      printToTerminal(message);
    });
  };

  const showAtomIds = () => {
    const atoms = KetcherFunctions.getSelectedAtomId();

    if (!atoms) {
      printToTerminal("No atoms selected");
    } else {
      printToTerminal("Selected atoms: " + atoms);
    }
  };

  const getStructure = async () => {
    KetcherFunctions.exportCtab().then((str) => {
      const message = "Export content:" + str;
      console.log(message);
      printToTerminal(message);
    });

    const url = process.env.REACT_APP_API_PATH!;
    const response = await fetch(url + "/indigo/aromatize", {
      method: "POST",
      body: JSON.stringify({
        struct: "C1=CC=CC=C1",
        output_format: "chemical/x-daylight-smiles",
      }),
    });

    console.log(response.data);
    return response.data;
  };

  return (
    <div className={style.flexboxCss}>
      <ControlsCard cardName="Selection">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            size="small"
            variant="contained"
            onClick={selectAll}
            sx={{ width: "120px" }}
            style={{ display: 'block', marginTop: '10px', lineHeight: '1.3', textTransform: 'none' }}
          >
            Select all
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={clearSelection}
            sx={{ width: "120px" }}
            style={{ display: 'block', marginTop: '10px', lineHeight: '1.3', textTransform: 'none' }}

          >
            Clear
          </Button>
        </div>
        <Button size="small" onClick={showAtomIds} variant="contained" style={{ display: 'block', marginTop: '10px', lineHeight: '1.3', textTransform: 'none' }}
        >
          Get Selected Atom ID
        </Button>

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
        <Button
          onClick={exportHandler}
          variant="contained"
          size="small"
          style={{ display: 'block', marginTop: '10px', lineHeight: '1.3', textTransform: 'none', marginTop: "15px", marginBottom: "15px" }}
        >
          Export as MDL Molfile V2000
        </Button>
      </ControlsCard>

      <input type="button" onClick={getStructure} value="" />
      <Button
        onClick={getStructure}
        variant="contained"
        size="small"
        style={{ display: 'block', marginTop: '10px', lineHeight: '1.3', textTransform: 'none', marginTop: "15px", marginBottom: "15px" }}
      >
        Get Structure
      </Button>
    </div>
  );
};
