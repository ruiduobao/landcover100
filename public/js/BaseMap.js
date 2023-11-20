//加载高德在线地图
// 定义地图层
let basicLayer = new AMap.TileLayer();
let satelliteLayer = new AMap.TileLayer.Satellite();
let roadNetLayer = new AMap.TileLayer.RoadNet();
let satelliteAndRoadNetLayer = [new AMap.TileLayer.Satellite(), new AMap.TileLayer.RoadNet()];



//定义星图地球
let XINGTU = new AMap.TileLayer({
    getTileUrl: function(x, y, z) {
        return 'https://tiles.geovisearth.com/base/v1/img/' + z + '/' + x + '/' + y + '.webp?format=webp&tmsIds=w&token=0aeb02f29320b060c2e2d0c04eb4887c6b8d5a8ed479b3aacff2b6a273b0d38d';
    },
    tileSize: 256,
    zIndex: 100
    });

// 初始化地图
let map = new AMap.Map('mapContainer', {
    zoom: 2,
    center: [105, 35],
    layers: [basicLayer]  // 默认显示遥感图层
});

//地图切换功能
function switchMapLayer() {
        const selectedLayer = document.getElementById('mapLayer').value;
        if (selectedLayer === 'satellite') {
            switchToSatelliteMap();
        } else if (selectedLayer === 'basic') {
            switchToBasicMap();
        } else if (selectedLayer === 'satellite_road') {
            switchToSatelliteAndRoadNetMap();            
        } else if (selectedLayer === 'star_map') {
            switchToStarMap();
        }
    }

function switchToSatelliteMap() {
    map.setLayers([satelliteLayer]);
}

function switchToBasicMap() {
    map.setLayers([basicLayer]);
}
function switchToSatelliteAndRoadNetMap() {
    map.setLayers(satelliteAndRoadNetLayer);
}
function switchToStarMap() {
    map.setLayers([XINGTU]);
    }
            
//绘制工具初始化
AMap.plugin(["AMap.MouseTool"],function () {
    mouseTool = new AMap.MouseTool(map);
});

var mouseTool = new AMap.MouseTool(map)
