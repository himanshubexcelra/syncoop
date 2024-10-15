import { Button, TextField, FormControl } from "@mui/material";
import { useState } from "react";
import { KetcherAPI } from "../../../utils/ketcherFunctions";
import style from "../page.module.css";

const selectHandler = (input: any) => {
  const arr = input.split(",");
  const numberArr = arr.map((item: any) => parseInt(item));
  KetcherAPI((global as any).ketcher).selectAtomsById(numberArr);
};

export const InputSelect = () => {
  const [input, setInput] = useState("");
  const [isError, setError] = useState(false);
  const regex = /^[0-9]+(,[0-9]+)*$/;

  const onChangeHandler = (event: any) => {
    setInput(event.target.value);
    const isInputValid = regex.test(event.target.value);
    setError(!isInputValid);
  };

  return (
    <FormControl className={style.formControlCss}>
      <TextField
        error={Boolean(input) && isError}
        helperText="Comma-separated: 1,2,3..."
        id="standard-basic"
        label="Select atoms by ID"
        variant="standard"
        inputProps={{ pattern: regex }}
        value={input}
        onChange={onChangeHandler}
        size="small"
        fullWidth
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Button
          disabled={!input || isError}
          variant="contained"
          onClick={() => selectHandler(input)}
          style={{ marginLeft: "10px", height: "30px" }}
          size="small"
        >
          Select
        </Button>
      </div>
    </FormControl>
  );
};
