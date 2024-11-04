import { Ref, forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { Button, Drawer, Radio, Tree, App } from 'antd';
import _ from 'lodash';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import './style.less';
import {
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  ScissorOutlined,
} from '@ant-design/icons';
import RegionSelector, { IRegionSelectorRef } from '../../components/regionSelector';
import { fetchCSV } from '../../utils';
import { RasterTileSource } from 'mapbox-gl';
import { clipRaster, downloadRaster, getTree, uploadGeoJson } from './api';
import useSWR from 'swr';

interface PropsType {
  map: mapboxgl.Map;
  draw: MapboxDraw;
}
export interface IDataDownloaderRef {
  handleResetDownload: () => void;
}

const baseUrl = (window as any).SNConfig.baseUrl;
let CSV_DATA: any[];
const WMTS_SOURCE_ID = 'WMTS_SOURCE_ID';
const WMTS_LAYER_ID = 'WMTS_LAYER_ID';

const DataDownloader = forwardRef((props: PropsType, ref: Ref<IDataDownloaderRef | undefined>) => {
  const regionRef = useRef<IRegionSelectorRef>();

  const { map, draw } = props;

  useImperativeHandle(ref, () => ({
    handleResetDownload: () => {
      handleResetDownload();
    },
  }));
  const { message } = App.useApp();

  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState();
  const [previewId, setPreviewId] = useState<string>();
  const [allowDownload, setAllowDownload] = useState(false);
  const [cliping, setCliping] = useState(false);
  const [cilpOutput, setCilpOutput] = useState<{
    filename: string;
    filepath: string;
  }>();

  const { data: treeData } = useSWR('/statics/datasourceTree.json', getTree);

  useEffect(() => {
    fetchDataTable();
  }, []);

  const fetchDataTable = async () => {
    CSV_DATA = (await fetchCSV(baseUrl + '/WMTS_excel/rasterDB_excel.csv')) || [];
  };

  const removeLayer = (id: string) => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  };

  const addWMTSLayer = (id: string) => {
    const one = _.find(CSV_DATA, (row: any) => row.id === id);
    if (!one) {
      return;
    }
    const url = one.wmts
      .replace(/TileMatrix=\d+/, 'TileMatrix={z}')
      .replace(/TileCol=\d+/, 'TileCol={x}')
      .replace(/TileRow=\d+/, 'TileRow={y}');

    const sourceData = {
      type: 'raster',
      tiles: [url],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 22,
    };
    const source = map.getSource(WMTS_SOURCE_ID) as RasterTileSource;
    if (source) {
      source.setTiles([url]);
    } else {
      map.addSource(WMTS_SOURCE_ID, {
        type: 'raster',
        data: sourceData,
      });
    }
    if (map.getLayer(WMTS_LAYER_ID)) {
      //
    } else {
      map.addLayer({
        id: WMTS_LAYER_ID,
        type: 'raster',
        source: WMTS_SOURCE_ID,
      });
    }
  };

  const togglePreview = (key: string) => {
    if (key === previewId) {
      setPreviewId(undefined);
      removeLayer(WMTS_LAYER_ID);
    } else {
      setPreviewId(key);
      addWMTSLayer(key);
    }
  };

  const handleClipRaster = async () => {
    try {
      if (!selected) {
        message.warning('请先选择数据源！');
        return;
      }
      const one = _.find(CSV_DATA, (row: any) => row.id === selected);
      if (!one) {
        message.warning('数据源缺失！');
        return;
      }
      setCliping(true);
      const { type, filepath } = regionRef.current?.getRegionValue() || ({} as any);
      let vectorFilepath = filepath;
      if (type === 'OnlineDraw') {
        vectorFilepath = await uploadGeoJson(draw.getAll());
      }
      const res = await clipRaster(vectorFilepath, selected, one.Absolute_path_server, [
        one.dataType,
        parseFloat(one.resolution),
        parseFloat(one.zip_level),
      ]);
      setCilpOutput(res);
      setCliping(false);
      setAllowDownload(true);
    } catch {
      handleResetDownload();
    }
  };

  const handleResetDownload = () => {
    setCliping(false);
    setAllowDownload(false);
    setCilpOutput(undefined);
  };

  const handleDownload = () => {
    if (cilpOutput) {
      downloadRaster(cilpOutput.filename);
    }
  };

  return (
    <>
      <Drawer
        title="数据源选择"
        getContainer={false}
        placement="left"
        mask={false}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Tree
          treeData={treeData}
          showLine
          selectable={false}
          defaultExpandedKeys={['土地覆盖数据', 'DEM高程数据']}
          expandAction="click"
          blockNode
          titleRender={(node: any) => {
            return (
              <div className="tree-node">
                {(node.children || []).length === 0 ? (
                  <Radio
                    checked={node.key === selected}
                    onClick={() => {
                      setCliping(false);
                      setAllowDownload(false);
                      setSelected(node.key);
                    }}
                  >
                    {node.title}
                  </Radio>
                ) : (
                  <span>{node.title}</span>
                )}
                <div>
                  {node.preview &&
                    (node.key === previewId ? (
                      <EyeOutlined
                        style={{ marginInlineStart: '12px', color: 'blue' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreview(node.key);
                        }}
                      />
                    ) : (
                      <EyeInvisibleOutlined
                        style={{ marginInlineStart: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreview(node.key);
                        }}
                      />
                    ))}
                  {node.instructionLink && (
                    <QuestionCircleOutlined
                      style={{ marginInlineStart: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(node.instructionLink);
                      }}
                    />
                  )}
                </div>
              </div>
            );
          }}
        />
      </Drawer>
      <Button
        className="filter-btn"
        icon={<FilterOutlined />}
        onClick={() => setOpen(true)}
      />
      <div className={open ? 'select-wrap active' : 'select-wrap'}>
        <RegionSelector
          {...props}
          ref={regionRef}
          handleResetDownload={() => {
            handleResetDownload();
          }}
        >
          {allowDownload ? (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload()}
            >
              下载
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<ScissorOutlined />}
              loading={cliping}
              onClick={() => handleClipRaster()}
            >
              {cliping ? '裁剪中' : '裁剪'}
            </Button>
          )}
        </RegionSelector>
      </div>
    </>
  );
});

export default DataDownloader;
