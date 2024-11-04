import axios from 'axios';

const baseUrl = (window as any).SNConfig.baseUrl;

export const getTree = async (treePath: string) => {
  const { data } = await axios.get(treePath);
  return data;
};

export const getXzqGeoJSON = async (code: string | number) => {
  const { data } = await axios({
    url: `${baseUrl}/getGsonDB`,
    method: 'POST',
    data: {
      code,
    },
  });
  const { filepath } = data;
  const { data: geojson } = await axios.get(`${baseUrl}${filepath}`);
  return {
    geojson,
    filepath,
  };
};
