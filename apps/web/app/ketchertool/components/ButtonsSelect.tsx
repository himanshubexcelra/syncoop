import { useCallback, useState } from "react";
import {
  Select,
  FormControl,
  MenuItem,
  ListItemText,
  Checkbox,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Button } from "@mui/material";
import { allButtons, buttonLabelMap } from "../constants/buttons";

type ButtonSelectProps = {
  hiddenButtons: string[];
  setHiddenButtons: (arg: string[]) => void;
};

export const ButtonsSelect = ({
  hiddenButtons,
  setHiddenButtons,
}: ButtonSelectProps) => {
  const [smileValue, setSmileValue] = useState("");
  const handleChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      const selectedButtons =
        typeof value === "string" ? value.split(",") : value;
      const hiddenButtons = getHiddenButtons(selectedButtons);
      setHiddenButtons(hiddenButtons);
    },
    [setHiddenButtons]
  );

  const hideAllButtons = useCallback(() => {
    setHiddenButtons(allButtons);
  }, [setHiddenButtons]);

  const showAllButtons = useCallback(() => {
    setHiddenButtons([]);
  }, [setHiddenButtons]);

  const handleSmile = useCallback(
    ($event: any) => {
      setSmileValue($event.target.value);
    },
    [setHiddenButtons]
  );

  const renderSmile = useCallback(
    (smileValue: any) => {
      console.log(smileValue);
      KetcherFunctions.renderFromCtab(smileValue);
    },
    [setHiddenButtons]
  );

  return (
    <FormControl>
      <TextField
        value={smileValue}
        onChange={handleSmile}
        size="small"
        fullWidth
      />
      <Button
        variant="contained"
        size="small"
        onClick={() => renderSmile(smileValue)}
        fullWidth
      >
        Render Reaction
      </Button>
      <Select
        multiple
        displayEmpty
        value={getVisibleButtons(hiddenButtons)}
        renderValue={() => "Choose Buttons to Show/Hide"}
        onChange={handleChange}
        size="small"
        sx={{ marginTop: "10px", fontSize: "13px" }}
      >
        {allButtons.map((buttonKey: any) => (
          <MenuItem key={buttonKey} value={buttonKey}>
            <Checkbox checked={hiddenButtons.indexOf(buttonKey) < 0} />
            <ListItemText primary={(buttonLabelMap as any)[buttonKey]} />
          </MenuItem>
        ))}
      </Select>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={hideAllButtons}
          fullWidth
        >
          Hide All
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={showAllButtons}
          fullWidth
        >
          Show All
        </Button>
      </div>
    </FormControl>
  );
};

function getVisibleButtons(hiddenButtons: string[]) {
  const visibleButtons = allButtons.filter(
    (button) => !hiddenButtons.includes(button)
  );
  return visibleButtons;
}

function getHiddenButtons(visibleButtons: string[]) {
  const hiddenButtons = allButtons.filter(
    (button) => !visibleButtons.includes(button)
  );
  return hiddenButtons;
}
