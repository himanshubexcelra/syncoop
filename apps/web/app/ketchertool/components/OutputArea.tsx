import { Typography, Button } from "@mui/material";
import style from "../page.module.css"
export const OutputArea = ({
  outputValue,
  setOutputValue,
}: {
  outputValue: string;
  setOutputValue: (arg: string) => void;
}) => {
  return (
    // <OuterBox>
    <div className="InnerBox">
      <div className={style.HeaderBox}>
        <Typography>Terminal</Typography>
      </div>
      <textarea className={style.textArea} value={outputValue} readOnly />
      <Button className={style.LowerButton} variant="outlined" onClick={() => setOutputValue("")}>
        Clear Terminal
      </Button>
    </div>
    // </OuterBox>
  );
};
