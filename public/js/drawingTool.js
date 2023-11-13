// 在地图上绘制图形的数组
let shapes = [];

// ... 这里可以添加更多处理绘制和GeoJSON转换的代码 ...
//初始化绘制工具
function drawPolygon () {
    removeShapes(); // 移除旧的形状
    selectIcon('drawIcon_polygon');
    mouseTool.polygon({
      strokeColor: "#FF33FF", 
      strokeOpacity: 1,
      strokeWeight: 6,
      strokeOpacity: 0.2,
      fillColor: '#1791fc',
      fillOpacity: 0.4,
      // 线样式还支持 'dashed'
      strokeStyle: "solid",
      // strokeStyle是dashed时有效
      // strokeDasharray: [30,10],
    })
  }

  function drawRectangle () {
    selectIcon('drawIcon_rect');
    removeShapes(); // 移除旧的形状
    mouseTool.rectangle({
      strokeColor:'red',
      strokeOpacity:0.5,
      strokeWeight: 6,
      fillColor:'blue',
      fillOpacity:0.5,
      // strokeStyle还支持 solid
      strokeStyle: 'solid',
      // strokeDasharray: [30,10],
    })
  }

  function drawCircle () {
    selectIcon('drawIcon_circle');
    removeShapes(); // 移除旧的形状
    mouseTool.circle({
      strokeColor: "#FF33FF",
      strokeOpacity: 1,
      strokeWeight: 6,
      strokeOpacity: 0.2,
      fillColor: '#1791fc',
      fillOpacity: 0.4,
      strokeStyle: 'solid',
      // 线样式还支持 'dashed'
      // strokeDasharray: [30,10],
    })
  }



// 针对高德地图的polygonToGeoJSON函数
function polygonToGeoJSON(polygon) {
    // 获取多边形的路径点
    var path = polygon.getPath();

    // 构建GeoJSON坐标数组
    var coordinates = [];

    // 遍历路径点，转换为GeoJSON需要的坐标格式
    path.forEach(function(lnglat) {
        coordinates.push([lnglat.getLng(), lnglat.getLat()]);
    });

    // 为了确保多边形闭合，将起始点坐标复制到数组末尾
    coordinates.push([path[0].getLng(), path[0].getLat()]);

    // 构建GeoJSON对象
    var geojson = {
        "type": "Feature",
        "properties": {}, // 可以添加自定义属性
        "geometry": {
        "type": "Polygon",
        "coordinates": [coordinates] // 多边形坐标是一个数组的数组
        }
    };

    return geojson;
}


// 将矩形转换为 GeoJSON 的函数
function rectangleToGeoJSON(rectangle) {
        var bounds = rectangle.getBounds();
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();

        // 构建 GeoJSON 对象
        var geojson = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [sw.lng, sw.lat],
                    [ne.lng, sw.lat],
                    [ne.lng, ne.lat],
                    [sw.lng, ne.lat],
                    [sw.lng, sw.lat] // 首尾闭合
                ]]
            }
    };
    return geojson;
}

// 将圆形转换为 GeoJSON 的函数
function circleToGeoJSON(circle) {
    var center = circle.getCenter();
    var radius = circle.getRadius();
    var coords = [];
  
    for (var i = 0; i < 360; i++) {
      var angle = i * Math.PI / 180;
      var lat = center.lat + (radius * Math.cos(angle) / 111320);
      var lng = center.lng + (radius * Math.sin(angle) / (111320 * Math.cos(center.lat * Math.PI / 180)));
      coords.push([lng, lat]);
    }
  
    // 闭合圆形
    coords.push(coords[0]);
  
    return {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [coords]
      }
    };
  }
  


// 监听绘制完毕事件并存储形状
mouseTool.on('draw', function(event) {
    shapes.push(event.obj); // 将新绘制的形状添加到数组中
    //使用坐标点将图形保存
    var geojson_file;
    if (event.obj instanceof AMap.Polygon) { // 判断是否为多边形
      geojson_file = polygonToGeoJSON(event.obj);
    } else if (event.obj instanceof AMap.Circle) { // 判断是否为圆形
      geojson_file = circleToGeoJSON(event.obj);
    } else if (event.obj instanceof AMap.Rectangle) { // 判断是否为矩形
      geojson_file = rectangleToGeoJSON(event.obj);
    }
    // 发送POST请求到服务器保存GeoJSON
    fetch('/savegeojson', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(geojson_file)
      })
      .then(response => response.json())  // 注意现在我们期望一个JSON响应
      .then(data => {
          // 在这里处理文件URL/路径
          console.log('Success:', data.fileUrl);
          loadGeoJSONfromPath(data.fileUrl)
          // 你可能想要做一些事情用这个文件URL，
          // 比如存储它，展示给用户等。
      })
      .catch((error) => {
          console.error('Error:', error);
      });

      
  });

//给选中的标签添加背景
function selectIcon(selectedId) {
    // 移除所有图标的选中样式
    document.querySelectorAll('#drawIcons img').forEach(img => {
        img.classList.remove('selected-icon');
    });

    // 为选中的图标添加选中样式
    document.getElementById(selectedId).classList.add('selected-icon');
}

