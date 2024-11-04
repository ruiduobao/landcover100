import { useRef, useState } from 'react';
import { Layout } from 'antd';
import HeaderContent from './components/header/HeaderContent';
import MapViewer from './pages/mapviewer';
import Beian from './components/footer/Beian';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import DataDownloader, { IDataDownloaderRef } from './pages/dataDownloader';

const { Header, Content } = Layout;
const App = () => {
  const dlRef = useRef<IDataDownloaderRef>();

  const [mapRef, setMapRef] = useState<mapboxgl.Map | null>(null);
  const [drawRef, setDrawRef] = useState<MapboxDraw | null>(null);

  return (
    <Layout>
      <Header>
        <HeaderContent />
      </Header>
      <Content id="main-content">
        <MapViewer
          handleMap={(map, draw) => {
            setMapRef(map);
            setDrawRef(draw);
          }}
          resetDownload={() => {
            dlRef.current?.handleResetDownload();
          }}
        />
        {mapRef && drawRef && (
          <DataDownloader
            map={mapRef}
            draw={drawRef}
            ref={dlRef}
          />
        )}
      </Content>
      <Beian />
    </Layout>
  );
};

export default App;
