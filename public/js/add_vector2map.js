//高德显示面矢量
function loadGeoJSONfromPath(filepath) {
    map.clearMap();
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
            
            // 根据GeoJSON覆盖物自动调整地图视野
            map.setFitView();

        })
        .catch(error => {
            console.error('Error loading GeoJSON data to the map:', error);
        });
}
