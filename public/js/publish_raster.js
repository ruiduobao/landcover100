//裁剪栅格的路径 让geoserver发布函数调用
let outputRasterPath
//裁剪栅格的文件名 让geoserver发布函数调用
let raster_filename
// 定义wmts图层变量
let currentWmtsLayer = null; 
//裁剪栅格数据
function clipRasterData() {
    return new Promise((resolve, reject) => {
        // 矢量文件的绝对路径
        const VECTOR_DIR_PATH="D:/website/landcover100/public"
        const vectorDataFilePath=VECTOR_DIR_PATH+geojson_path[0]
        //准备裁剪的栅格数据路径
        const inputRasterDirPath="D:/website/landcover100/public/raster_data_DB/"
        const inputRasterPath=inputRasterDirPath+selected_DataDB_NAME+".tif"

        //裁剪后的栅格绝对路径
        var filenameWithExtension = geojson_path[0].split('/').pop(); // 获取文件名和后缀
        raster_filename = filenameWithExtension.split('.').shift()+"_"+selected_DataDB_NAME; // 获取不包含后缀的文件名
        var raster_output_DIR_PATH="D:/website/landcover100/public/raster_output_fromDB/"
        outputRasterPath =raster_output_DIR_PATH+raster_filename+".tif"
        //裁剪后的文件名
        raster_output_NAME_FULL=raster_filename+".tif"

        // 准备发送到服务器的数据
        const data = {vectorDataFilePath,outputRasterPath,inputRasterPath};

        // 发送 POST 请求到服务器
        fetch('/clip-dem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('裁剪成功，结果文件路径:', data.outputPath);
            resolve(data); // 解析 Promise
        })
        .catch(error => {
            console.error('裁剪栅格数据时发生错误:', error);
            reject(error); // 拒绝 Promise
        });
    });
}



//加载已经在geoserver的影像
function createWmtsLayer(wmtsBaseUrl) {
    // 创建一个新的 AMap.TileLayer 实例
    let wmtsLayer = new AMap.TileLayer({
        getTileUrl: function(x, y, z) {
            // 使用正则表达式替换 TileMatrix, TileCol, TileRow 参数的值
            return wmtsBaseUrl.replace(/TileMatrix=\d+/, `TileMatrix=${z}`)
                              .replace(/TileCol=\d+/, `TileCol=${x}`)
                              .replace(/TileRow=\d+/, `TileRow=${y}`);
        },
        tileSize: 256,
        zIndex: 100
    });

    return wmtsLayer;
}

function addWmtsLayerToMap(map, wmtsBaseUrl) {
    // 如果当前已有 WMTS 图层，则先移除
    if (currentWmtsLayer) {
        map.remove([currentWmtsLayer]);
    }

    // 创建新的 WMTS 图层
    let wmtsLayer = createWmtsLayer(wmtsBaseUrl);

    // 更新当前图层引用
    currentWmtsLayer = wmtsLayer;

    // 将图层添加到地图
    map.add([wmtsLayer]);
}


// 从本地传输tif到服务器，并发布数据
function publish_Raster() {
    // 先裁剪栅格
    clipRasterData()
    .then(() => {
        const workspace = 'landcover100_DEM';
        const storename = raster_filename;
        const coverageName = raster_filename;
        const filePath = outputRasterPath;

        return fetch('/publishRaster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                workspace: workspace,
                storename: storename,
                coverageName: coverageName,
                filePath: filePath,
            }),
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        console.log('Raster Published! WMTS Link: ' + data.wmtsLink);
        // 将发布的数据加载到地图中
        addWmtsLayerToMap(map, data.wmtsLink);
    })
    .catch((error) => {
        // 这个 catch 会捕获裁剪和发布中的任何错误
        console.error('Error:', error);
        alert('Error during raster processing.');
    });
}