import { useState } from 'react';
import { Button } from '@mui/material';
import styles from "../page.module.css";

const parseFile = (file: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsText(file, 'UTF-8');

    reader.onload = function (evt) {
      const fileContent = evt?.target?.result;
      if (typeof fileContent === 'string') {
        resolve(fileContent);
      }
      resolve('');
    };
    reader.onerror = function (err) {
      reject(err);
    };
  });

const submitHandler = (event: any) => {
  event.preventDefault();
  const file = event.target[0].files[0];

  parseFile(file).then((str) => {
    KetcherFunctions.renderFromCtab(str);
  });
};

interface FileInputProps {
  printToTerminal: (str: string) => void;
}

export const FileInputForm = ({ printToTerminal }: FileInputProps) => {
  const [chosenFile, setFile] = useState('');

  const chooseFileHandler = (event: any) => {
    const file: File = event.target.files[0];
    setFile(file.name);

    parseFile(file).then((str) => {
      const message = 'Selected file content:' + str;
      printToTerminal(message);
    });
  };

  return (
    <>
      <div className={styles.formClass} onSubmit={submitHandler}>
        <Button
          component="label"
          size="small"
          variant="outlined"
          sx={{ marginTop: '10px', lineHeight: '1.3' }}
          fullWidth
        >
          Select file
          <input
            hidden
            type="file"
            name="file-upload"
            onChange={chooseFileHandler}
          />
        </Button>
        <Button style={{ display: 'block', marginTop: '10px', lineHeight: '1.3', textTransform: 'none' }}
          type="submit"
          variant="contained"
          size="small"
          disabled={!chosenFile}
          fullWidth
        >
          Render file
        </Button>
      </div>
      <div className={styles.fileNameBox}>
        <span>{chosenFile}</span>
      </div>
    </>
  );
};
