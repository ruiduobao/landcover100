import { Ref, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import _ from 'lodash';

import mapboxgl, { MapOptions } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './style.less';
import defaultDrawStyle from './theme.ts';
import { BASE_LAYERS } from '../../constants/baseLayers.ts';
import { Popover } from 'antd';
import Geocoder from '../../components/geocoder/Geocoder.tsx';

const mapOpts: MapOptions = {
  container: '',
  style: BASE_LAYERS[0].style,
  center: [104.06326907753925, 30.66082727261535],
  zoom: 3,
};

interface PropsType {
  handleMap: (map: mapboxgl.Map | null, draw: MapboxDraw | null) => void;
  resetDownload: () => void;
}

interface IPosition {
  lat: string;
  lon: string;
}

export interface IMapViewerRef {
  resetDraw: () => void;
}

const MapViewer = forwardRef((props: PropsType, ref: Ref<IMapViewerRef | undefined>) => {
  const mapRef = useRef<mapboxgl.Map | null>();
  const drawRef = useRef<MapboxDraw>();
  const markerRef = useRef<mapboxgl.Marker>();

  const { handleMap, resetDownload } = props;

  useImperativeHandle(ref, () => ({
    resetDraw: () => {
      drawRef.current?.deleteAll();
    },
  }));

  const [curBaseLayer, setCurBaseLayer] = useState(BASE_LAYERS[0]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      ...mapOpts,
      container: 'map', // container ID
    });
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        point: false,
        line_string: false,
        trash: true,
      },
      boxSelect: false,
      styles: defaultDrawStyle,
      userProperties: true,
    });
    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl());
    map.on('draw.create', (e: any) => {
      handleCreateFeature(e.features);
    });
    map.on('draw.update', (e: any) => {
      handleUpdateFeature(e.features, e.action);
    });
    map.on('draw.delete', (e: any) => {
      handleDeleteFeature(e.features);
    });
    drawRef.current = draw;
    mapRef.current = map;
    handleMap(map, draw);
    return () => {
      handleMap(null, null);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // draw的创建事件
  const handleCreateFeature = async (features: GeoJSON.FeatureCollection['features']) => {
    drawRef.current?.deleteAll();
    drawRef.current?.add(features[0]);
    resetDownload();
  };

  // draw的更新事件
  const handleUpdateFeature = async (
    _features: GeoJSON.FeatureCollection['features'],
    action: string,
  ) => {
    switch (action) {
      case 'change_coordinates':
        break;
      default:
        break;
    }
    resetDownload();
  };

  // draw的删除事件
  const handleDeleteFeature = async (_features: GeoJSON.FeatureCollection['features']) => {
    resetDownload();
  };

  // 处理geocoder
  const handleSelect = (position: IPosition | undefined) => {
    markerRef.current?.remove();
    if (mapRef.current && position) {
      mapRef.current.flyTo({
        center: [Number(position.lon), Number(position.lat)],
        essential: true,
      });
      markerRef.current = new mapboxgl.Marker({
        color: 'red',
      })
        .setLngLat([Number(position.lon), Number(position.lat)])
        .addTo(mapRef.current);
    }
  };

  const baseLayerList = useMemo(
    () => (
      <div className="base-layer-list">
        {_.map(BASE_LAYERS, (lyr) => {
          return (
            <div
              className="base-layer-card"
              style={{ borderColor: lyr.thumbnail === curBaseLayer.thumbnail ? '#5298ff' : '#ccc' }}
              key={lyr.thumbnail}
              onClick={() => {
                setCurBaseLayer(lyr);
                mapRef.current?.setStyle(lyr.style);
              }}
            >
              <img src={lyr.thumbnail} />
              <div>{lyr.title}</div>
            </div>
          );
        })}
      </div>
    ),
    [curBaseLayer.thumbnail],
  );

  return (
    <div className="map-wrapper">
      <div
        className="map"
        id="map"
      ></div>

      <Popover
        placement="leftTop"
        content={baseLayerList}
      >
        <div className="layer-switch-trigger base-layer-card">
          <img src={curBaseLayer.thumbnail} />
          {/* <div>{curBaseLayer.title}</div> */}
        </div>
      </Popover>
      <div className="geocoder">
        <Geocoder handleSelect={handleSelect} />
      </div>
    </div>
  );
});

export default MapViewer;
