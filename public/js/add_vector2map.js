// 存储所有GeoJSON图层的数组
let geoJsonLayers = [];

// 高德显示面矢量
function loadGeoJSONfromPath(filepath) {
    map.clearMap(); // 清除地图上所有覆盖物
    removeAllGeoJSONLayers(); // 清除所有已加载的GeoJSON图层
    fetch(filepath)
        .then(response => response.json())
        .then(geojsonData => {
            const geojson = new AMap.GeoJSON({
                geoJSON: geojsonData,
                getPolygon: function(geojson, lnglats) {
                    return new AMap.Polygon({
                        path: lnglats,
                        strokeColor: '#ff33cc',
                        fillColor: '#ffc3a0',
                        fillOpacity: 0.5
                    });
                }
            });
            geojson.setMap(map);
            geoJsonLayers.push(geojson); // 将该GeoJSON图层保存到数组中
            
            // 根据GeoJSON覆盖物自动调整地图视野
            map.setFitView();

        })
        .catch(error => {
            console.error('Error loading GeoJSON data to the map:', error);
        });
}

// 移除地图上所有GeoJSON图层
function removeAllGeoJSONLayers() {
    for (let layer of geoJsonLayers) {
        layer.setMap(null); // 移除GeoJSON图层
    }
    geoJsonLayers = []; // 清空数组
}
// 移除地图上所有的形状
function removeShapes() {
    for (let shape of shapes) {
      shape.setMap(null); // 移除形状
    }
    shapes = []; // 清空数组
  }
  
// 调用此函数来移除所有绘制的形状和GeoJSON图层
function clearAllMapData() {
    removeShapes();        // 移除所有绘制的形状
    removeAllGeoJSONLayers(); // 移除所有GeoJSON图层
}
