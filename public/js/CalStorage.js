//预计下载文件的大小
let RasterStorageSize
async function calculateRasterSize(areaSqKm, dataType, resolution, zip_level) {
    const bytesPerDataType = {
        'byte': 1,
        'int16': 2,
        'uint16': 2,
        'int32': 4,
        'uint32': 4,
        'float32': 4,
        'float64': 8,
        'cint16': 4,
        'cint32': 8,
        'cfloat32': 8,
        'cfloat64': 16
    };
    // 尝试将参数转换为数字
    console.log(resolution )
    areaSqKm = parseFloat(areaSqKm);
    resolution = parseFloat(resolution);
    zip_level = parseFloat(zip_level);
    console.log(resolution )
    // 检查输入参数是否存在
    if (areaSqKm === undefined || dataType === undefined || resolution === undefined || zip_level === undefined) {
        throw new Error('所有参数都必须提供');
    }

    // 检查数据类型是否有效
    if (!bytesPerDataType[dataType]) {
        throw new Error('无效的数据类型');
    }

    // 检查输入参数类型是否正确
    if (typeof areaSqKm !== 'number' || typeof resolution !== 'number' || typeof zip_level !== 'number') {
        throw new Error('面积、分辨率和压缩率必须是数字');
    }

    // 检查输入参数是否为正数
    if (areaSqKm <= 0 || resolution <= 0 || zip_level <= 0) {
        throw new Error('面积、分辨率和压缩率必须是正数');
    }

    const pixelsPerSqKm = (1000 / resolution) ** 2;
    const totalPixels = areaSqKm * pixelsPerSqKm;
    const fileSizeBytes = totalPixels * bytesPerDataType[dataType];
    const fileSizeMB = fileSizeBytes / (zip_level * 1024 ** 2);
    console.log(pixelsPerSqKm,totalPixels,fileSizeBytes,fileSizeMB)
    console.log(type(pixelsPerSqKm),type(totalPixels),type(fileSizeBytes),type(fileSizeMB))
    return fileSizeMB;
}




//判定矢量数据的大小
//1.计算矢量数据的面积
const Vector_are=CalArea(vectorDataFilePath)
console.log("Vector_are",Vector_are)
//2.计算文件大小
console.log("dataType",dataType)
console.log("resolution",resolution)
console.log("zip_level",zip_level)
RasterStorageSize=calculateRasterSize(Vector_are, dataType, resolution,zip_level)

console.log("RasterStorageSize",RasterStorageSize)

// 判定矢量数据的大小
async function computeAndLog(vectorDataFilePath) {
    RasterStorageSize=0
    // 1.计算矢量数据的面积
    const Vector_are = await CalArea(vectorDataFilePath);
    console.log("Vector_are", Vector_are);

    // 2.计算文件大小
    console.log("dataType", dataType);
    console.log("resolution", resolution);
    console.log("zip_level", zip_level);
    RasterStorageSize = await calculateRasterSize(Vector_are, dataType, resolution, zip_level);

    console.log("RasterStorageSize", RasterStorageSize);
}
