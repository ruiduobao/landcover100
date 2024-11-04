export * as Setting from './Setting';
import { calculateRasterSize } from './calculateRasterSize';
const parseCSV = (csv: string) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j];
    }

    result.push(obj);
  }

  return result;
};
const fetchCSV = async (filePath: string) => {
  try {
    const data = await new Promise((resolve, reject) => {
      fetch(filePath)
        .then((response) => response.text())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
    const csvData = parseCSV(data as string);
    return csvData;
  } catch {
    //
  }
};

export { fetchCSV, calculateRasterSize };
