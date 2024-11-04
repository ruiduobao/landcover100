import { Ref, forwardRef, useImperativeHandle, useState } from 'react';
import { Cascader, Select, Space, Upload } from 'antd';
import axios from 'axios';
import useSWR from 'swr';
import './style.less';
import _ from 'lodash';
import { GeoJSONSource } from 'mapbox-gl';
import { center } from '@turf/turf';
import { getTree, getXzqGeoJSON } from './apis';

interface PropsType {
  map: mapboxgl.Map;
  draw: MapboxDraw;
  children: React.ReactElement;
  handleResetDownload: () => void;
}
export interface IRegionSelectorRef {
  getRegionValue: () => void;
}

const baseUrl = (window as any).SNConfig.baseUrl;

const XZQ_SOURCE_ID = 'XINGZHENGQU_SOURCE';
const XZQ_FILL_LAYER_ID = 'XINGZHENGQU_FILL_LAYER';
const XZQ_OUTLINE_LAYER_ID = 'XINGZHENGQU_OUTLINE_LAYER';
const UPD_SOURCE_ID = 'UPLOAD_SOURCE';
const UPD_FILL_LAYER_ID = 'UPLOAD_FILL_LAYER';
const UPD_OUTLINE_LAYER_ID = 'UPLOAD_OUTLINE_LAYER';

const RegionSelector = forwardRef((props: PropsType, ref: Ref<IRegionSelectorRef | undefined>) => {
  const { map, draw, handleResetDownload } = props;

  useImperativeHandle(ref, () => ({
    getRegionValue: () => {
      return {
        type,
        filepath,
      };
    },
  }));

  const [type, setType] = useState('AdministrativeDivision');
  const [cascaderValue, setCascaderValue] = useState<(string | number)[]>([]);
  const [filepath, setFilepath] = useState<string>();

  const { data: treeData } = useSWR('/statics/xzqTree.json', getTree);

  const removeLayer = (id: string) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  };

  const addLayer = (
    sourceId: string,
    fillId: string,
    lineId: string,
    sourceData: GeoJSON.GeoJSON,
  ) => {
    const source = map.getSource(sourceId) as GeoJSONSource;
    if (source) {
      source.setData(sourceData);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: sourceData,
      });
    }
    if (map.getLayer(fillId)) {
      //
    } else {
      map.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#fbb03b',
          'fill-opacity': 0.5,
        },
      });
    }
    if (map.getLayer(lineId)) {
      //
    } else {
      map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#f540c6',
          'line-width': 2,
        },
      });
    }
    const ct = center(sourceData);
    map.flyTo({
      center: ct.geometry.coordinates as any,
      speed: 2,
      zoom: 9,
    });
  };

  const handleTypeChange = (type: string) => {
    handleResetDownload();
    setType(type);
    draw.trash();
    _.each(
      [XZQ_FILL_LAYER_ID, XZQ_OUTLINE_LAYER_ID, UPD_FILL_LAYER_ID, UPD_OUTLINE_LAYER_ID],
      (id) => removeLayer(id),
    );
  };

  const handleCascaderChange = async (value: (string | number)[]) => {
    setCascaderValue(value);
    handleResetDownload();
    const code = _.last(value);
    if (code) {
      const { geojson, filepath } = await getXzqGeoJSON(code);
      setFilepath(filepath);
      addLayer(XZQ_SOURCE_ID, XZQ_FILL_LAYER_ID, XZQ_OUTLINE_LAYER_ID, geojson);
    }
  };

  const handleUploadChange = async ({ file }: any) => {
    handleResetDownload();
    if (file.status === 'done') {
      const { fileUrl } = file.response;
      setFilepath(fileUrl);
      const { data: geojson } = await axios.get(`${baseUrl}${fileUrl}`);
      addLayer(UPD_SOURCE_ID, UPD_FILL_LAYER_ID, UPD_OUTLINE_LAYER_ID, geojson);
    }
  };

  return (
    <Space align="start">
      <Select
        options={[
          {
            label: '按行政区',
            value: 'AdministrativeDivision',
          },
          {
            label: '本地上传',
            value: 'LocalUpload',
            // disabled: true,
          },
          {
            label: '在线勾绘',
            value: 'OnlineDraw',
          },
        ]}
        value={type}
        onChange={handleTypeChange}
      />
      {type === 'AdministrativeDivision' && (
        <Cascader
          style={{ width: '300px' }}
          options={treeData}
          changeOnSelect
          showSearch
          maxTagTextLength={3}
          expandTrigger="hover"
          value={cascaderValue}
          onChange={(value) => {
            handleCascaderChange(value as any);
          }}
        />
      )}
      {type === 'LocalUpload' && (
        <div className="upload-wrap">
          <Upload
            accept=".geojson,.kml,.shp"
            maxCount={1}
            action={baseUrl + '/uploadvector'}
            onChange={handleUploadChange}
          >
            <div>请上传矢量文件(支持上传shp、geojson和kml格式)</div>
          </Upload>
        </div>
      )}
      {props.children}
    </Space>
  );
});

export default RegionSelector;
