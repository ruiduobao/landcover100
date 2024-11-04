import axios from 'axios';
import dayjs from 'dayjs';
import { calculateRasterSize } from '../../utils';

const baseUrl = (window as any).SNConfig.baseUrl;
const VECTOR_DIR_PATH = (window as any).SNConfig.VECTOR_DIR_PATH;
const MAX_ALLOWED_SIZE = (window as any).SNConfig.MAX_ALLOWED_SIZE;
const RASTER_OUTPUT_DIR_PATH = (window as any).SNConfig.RASTER_OUTPUT_DIR_PATH;

const calcArea = async (fullpath: string) => {
  const { data } = await axios({
    url: `${baseUrl}/calculate_area`,
    method: 'POST',
    data: {
      vectorDataFilePath: fullpath,
    },
  });
  return parseFloat(data.area) || 0;
};

const shouldClip = async (fullpath: string, ortherParams: [string, number, number]) => {
  const area = await calcArea(fullpath);
  const size = calculateRasterSize(area, ...ortherParams);
  return size <= MAX_ALLOWED_SIZE;
};

const clipRaster = async (
  vectorFilepath: string,
  dataId: string,
  rasterPath: string,
  ortherParams: [string, number, number],
): Promise<{
  filename: string;
  filepath: string;
}> => {
  const vectorDataFilePath = VECTOR_DIR_PATH + vectorFilepath;
  const allowed = await shouldClip(vectorDataFilePath, ortherParams);
  if (allowed) {
    const inputRasterPath = rasterPath;
    const vectorFileName = vectorFilepath.match(/\/([^/]+)\.gson$/)?.[1] || '';
    const outputRasterName =
      vectorFileName +
      '_' +
      dataId +
      '_' +
      dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') +
      '.tif';
    const outputRasterPath = RASTER_OUTPUT_DIR_PATH + outputRasterName;

    // 准备发送到服务器的数据
    const { data } = await axios({
      url: `${baseUrl}/clip_raster`,
      method: 'POST',
      data: {
        vectorDataFilePath,
        outputRasterPath,
        inputRasterPath,
      },
    });
    return {
      filepath: data.outputPath,
      filename: outputRasterName,
    };
  } else {
    throw new Error('预计文件超过100M,本网站是非盈利网站,超出网站的服务范围,请缩小面积');
  }
};

const downloadRaster = (filename: string) => {
  window.location.href = `${baseUrl}/download_raster?filePath=${filename}`;
};

const uploadGeoJson = async (geojson: GeoJSON.GeoJSON): Promise<string> => {
  const { data } = await axios({
    url: `${baseUrl}/savegeojson`,
    method: 'POST',
    data: geojson,
  });
  return data.fileUrl;
};

const getTree = async (treePath: string) => {
  const { data } = await axios.get(treePath);
  return data;
};

export { clipRaster, downloadRaster, uploadGeoJson, getTree };
