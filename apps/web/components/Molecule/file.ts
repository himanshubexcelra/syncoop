import CustomFile from "../../utils/file";

export const downloadCSV = (
    header: any,
    data: any,
    filename: string) => {

    const rows: any = [header, ...data];
    const csvData = CustomFile.convertToCSV(rows);
    return CustomFile.downLoad(csvData, filename, 'csv');
}