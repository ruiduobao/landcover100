import { StyleSpecification } from 'mapbox-gl';
import imgThumbnail from '../assets/imgs/img.png';
import vecThumbnail from '../assets/imgs/vec.png';

const tiandituToken = (window as any).SNConfig.tiandituToken;
const imgwUrl =
  'https://t0.tianditu.gov.cn/img_w/wmts?' +
  'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&' +
  'TILEMATRIXSET=w&FORMAT=tiles&' +
  'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  tiandituToken;
const ciawUrl =
  'https://t0.tianditu.gov.cn/cia_w/wmts?' +
  'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&' +
  'TILEMATRIXSET=w&FORMAT=tiles&' +
  'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  tiandituToken;
const vecwUrl =
  'https://t0.tianditu.gov.cn/vec_w/wmts?' +
  'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&' +
  'TILEMATRIXSET=w&FORMAT=tiles&' +
  'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  tiandituToken;
const cvawUrl =
  'https://t0.tianditu.gov.cn/cva_w/wmts?' +
  'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&' +
  'TILEMATRIXSET=w&FORMAT=tiles&' +
  'TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  tiandituToken;

const imgStyle: StyleSpecification = {
  version: 8,
  sources: {
    imgw: {
      type: 'raster',
      tiles: [imgwUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 22,
    },
    ciaw: {
      type: 'raster',
      tiles: [ciawUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 22,
    },
  },
  layers: [
    {
      id: 'imgw',
      type: 'raster',
      source: 'imgw',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'ciaw',
      type: 'raster',
      source: 'ciaw',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const vecStyle: StyleSpecification = {
  version: 8,
  sources: {
    vecw: {
      type: 'raster',
      tiles: [vecwUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 22,
    },
    cvaw: {
      type: 'raster',
      tiles: [cvawUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 22,
    },
  },
  layers: [
    {
      id: 'vecw',
      type: 'raster',
      source: 'vecw',
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: 'cvaw',
      type: 'raster',
      source: 'cvaw',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const BASE_LAYERS = [
  {
    title: '影像底图',
    thumbnail: imgThumbnail,
    style: imgStyle,
  },
  {
    title: '矢量底图',
    thumbnail: vecThumbnail,
    style: vecStyle,
  },
];
