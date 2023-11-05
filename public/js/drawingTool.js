// 用来在地图上绘制图形

// 监听select的变化，显示或隐藏绘制图标
function handleSelectChange() {
    var select = document.getElementById('data_type_select');
    var drawIcon = document.getElementById('drawIcon');
    if (select.value === 'type3') { // 确认选中的是在线勾画
        drawIcon.style.display = 'inline'; // 显示图标
    } else {
        drawIcon.style.display = 'none'; // 隐藏图标
    }
}

// 开始绘制矩形的逻辑
function startDrawing() {
    // 在这里添加高德地图绘制矩形的代码
    // 例如，使用高德地图的MouseTool插件来绘制矩形
    // 然后把绘制的矩形信息转换为GeoJSON
}

// ... 这里可以添加更多处理绘制和GeoJSON转换的代码 ...
