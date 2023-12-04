//矢量文件的绝对路径
let VECTOR_DIR_PATH="E:/ruiduobao/MY_website/landcover100_com/public"
//栅格文件保存的绝对路径
let raster_output_DIR_PATH="E:/ruiduobao/MY_website/landcover100_com/public/raster_output_fromDB/"

//裁剪栅格的路径 让geoserver发布函数调用
let outputRasterPath
//裁剪栅格的文件名 让geoserver发布函数调用
let raster_filename
// 定义wmts图层变量
let currentWmtsLayer = null; 

//定义栅格数据的dataType、resolution、zip_level
let dataType
let resolution
let zip_level



//下载按钮的显示和隐藏
function showDownloadDiv() {
    var downloadDiv = document.getElementById("DOWNLOAD_DIV");
    downloadDiv.style.display = "block"; // 设置为显示
  }
  
function hideDownloadDiv() {
var downloadDiv = document.getElementById("DOWNLOAD_DIV");
downloadDiv.style.display = "none"; // 设置为隐藏
}
// 替代Papa Parse的CSV解析调用 查找对应的栅格保存路径
function findDBpathByIdAndExecute(id) {
    return new Promise((resolve, reject) => {
        const filePath = '/WMTS_excel/rasterDB_excel.csv';
        fetchCSV(filePath)
            .then(data => {
                const csvData = parseCSV(data);
                const entry = csvData.find(row => row.id === id);
                if (entry) {
                    resolve(entry.Absolute_path2);
                } else {
                    reject('No matching ID found');
                }
            })
            .catch(error => reject('Error loading CSV: ' + error));
    });
  }

//判断是否裁剪初始化
let CLIP_raster_yes_or_no
let MAX_SIZE_FREE=100
//判断是否进行裁剪的函数
async function clipRasterData_yes_or_no(vectorDataFilePath) {
    CLIP_raster_yes_or_no=false
    //等待文件大小结果解析完成
    RasterStorageSize=await computeAndLog(vectorDataFilePath);
    console.log("预计文件大小为",RasterStorageSize)
    if (RasterStorageSize<MAX_SIZE_FREE){CLIP_raster_yes_or_no=true}
    return CLIP_raster_yes_or_no
}

//裁剪栅格数据
function clipRasterData() {
    // 矢量文件的绝对路径
    const vectorDataFilePath = VECTOR_DIR_PATH + geojson_path[0]

    //判断文件是否需要下载
    return clipRasterData_yes_or_no(vectorDataFilePath)
        .then(CLIP_raster_yes_or_no => {
            console.log("RasterStorageSize在function clipRasterData的状态", CLIP_raster_yes_or_no)

            //预计面积小于100M才进行下载
            if (CLIP_raster_yes_or_no) {
                //准备裁剪的栅格数据路径
                const selected_DataDB_NAME_ID = selected_DataDB_NAME
                console.log(selected_DataDB_NAME_ID)

                //找到栅格数据对应的绝对路径
                return findDBpathByIdAndExecute(selected_DataDB_NAME_ID)
                    .then(Absolute_path => {
                        raster_filename = null
                        console.log(Absolute_path)
                        const inputRasterPath = Absolute_path

                        //裁剪后的栅格绝对路径
                        var filenameWithExtension = geojson_path[0].split('/').pop(); // 获取文件名和后缀
                        const raster_filename_old = filenameWithExtension.split('.').shift() + "_" + selected_DataDB_NAME; // 获取不包含后缀的文件名
                        raster_filename = renameFileWithTimestamp(raster_filename_old) //将文件名改为带时间的
                        outputRasterPath = raster_output_DIR_PATH + raster_filename + ".tif"
                        console.log("outputRasterPath", outputRasterPath)

                        //裁剪后的文件名
                        raster_output_NAME_FULL = raster_filename + ".tif"

                        // 准备发送到服务器的数据
                        const data = { vectorDataFilePath, outputRasterPath, inputRasterPath };

                        // 发送 POST 请求到服务器
                        return fetch('/clip_raster', {
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
                                return data; // 返回结果
                            })
                            .catch(error => {
                                console.error('裁剪栅格数据时发生错误:', error);
                                throw error; // 抛出错误
                            });
                    })
                    .catch(error => {
                        console.log(error);
                        throw error; // 抛出错误
                    });
            }
            else {
                console.log("预计文件超过100M，本网站是非盈利网站，超出网站的服务范围，请缩小面积")
                alert("预计文件超过100M，本网站是非盈利网站，超出网站的服务范围，请缩小面积");
                throw new Error("预计文件超过100M，本网站是非盈利网站，超出网站的服务范围，请缩小面积");

            }
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
    try {
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
    } catch (error) {
        console.log(error);
    }
    
}


// 从本地传输tif到服务器，并发布数据
function publish_Raster() {
    //下载函数隐藏
    hideDownloadDiv()
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
        //下载按钮显示
        showDownloadDiv()
        // 将发布的数据加载到地图中
        addWmtsLayerToMap(map, data.wmtsLink);
        
    })
    .catch((error) => {
        // 这个 catch 会捕获裁剪和发布中的任何错误
        console.error('Error:', error);
    });
}