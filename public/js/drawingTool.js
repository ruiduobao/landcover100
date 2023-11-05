// 用来在地图上绘制图形

// 监听select的变化，显示或隐藏绘制图标
function handleSelectChange() {
    var select = document.getElementById('data_type_select');
    var drawIcon = document.getElementById('drawIcons');
    if (select.value === 'type3') { // 确认选中的是在线勾画
        drawIcon.style.display = 'inline'; // 显示图标
    } else {
        drawIcon.style.display = 'none'; // 隐藏图标
    }
}

// 在地图上绘制图形的数组
let shapes = [];

// 移除地图上所有的形状
function removeShapes() {
  for (let shape of shapes) {
    shape.setMap(null); // 移除形状
  }
  shapes = []; // 清空数组
}


// ... 这里可以添加更多处理绘制和GeoJSON转换的代码 ...
//初始化绘制工具
function drawPolygon () {
    removeShapes(); // 移除旧的形状
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

// 监听绘制完毕事件并存储形状
mouseTool.on('draw', function(event) {
    shapes.push(event.obj); // 将新绘制的形状添加到数组中
    var geojson_file = rectangleToGeoJSON(event.obj);
    // 发送POST请求到服务器保存GeoJSON
    fetch('/savegeojson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geojson_file)
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
  });