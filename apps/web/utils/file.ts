import streamSaver from 'streamsaver';

declare global {
    interface Window {
        writer: WritableStreamDefaultWriter<any>;
    }
}

class CustomFile {
    static downLoad(data: string, fileName: string, fileType: string) {
        const blob = new Blob([data]);
        const fileStream = streamSaver.createWriteStream(fileName + '.' + fileType, {
            size: blob.size,
        });

        const readableStream = blob.stream();
        if (window.WritableStream && readableStream.pipeTo) {
            return readableStream.pipeTo(fileStream)
                .then(() => console.log('done writing'));
        }
        window.writer = fileStream.getWriter();

        const reader = readableStream.getReader();
        const pump = () : any => reader.read()
            .then(res => res.done
                ? window.writer.close()
                : window.writer.write(res.value).then(pump));

        pump();
    }

    static convertToCSV(array: any) {
        let str = '';
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const index in array[i]) {
                if (line != '') line += ',';
                line += array[i][index];
            }
            str += line + '\r\n';
        }
        return str;
    }
}

export default CustomFile;
