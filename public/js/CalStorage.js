//计算用户想下载的数据大小 （面积、数据深度、分辨率、压缩率）
function calculateRasterSize(areaSqKm, dataType, resolution,zip_level) {
    // 数据类型对应的字节数
    const bytesPerDataType = {
        'byte': 1,        // 8位
        'int16': 2,       // 16位有符号整数
        'uint16': 2,      // 16位无符号整数
        'int32': 4,       // 32位有符号整数
        'uint32': 4,      // 32位无符号整数
        'float32': 4,     // 32位浮点数
        'float64': 8,     // 64位浮点数
        'cint16': 4,      // 复数，16位整数
        'cint32': 8,      // 复数，32位整数
        'cfloat32': 8,    // 复数，32位浮点数
        'cfloat64': 16    // 复数，64位浮点数
    };

    // 检查数据类型是否有效
    if (!bytesPerDataType[dataType]) {
        throw new Error("无效的数据类型");
    }

    // 计算每平方公里的像素数
    const pixelsPerSqKm = (1000 / resolution) ** 2;

    // 计算总像素数
    const totalPixels = areaSqKm * pixelsPerSqKm;

    // 计算文件大小（字节）
    const fileSizeBytes = totalPixels * bytesPerDataType[dataType];

    // 转换文件大小为兆字节 (MB)
    const fileSizeMB = fileSizeBytes / (zip_level*1024 ** 2);

    return fileSizeMB;
}

// 示例：计算 1 平方公里、float32 数据类型、10 米分辨率的文件大小
const area = 9600000;          // 平方公里
const dataType = 'byte';    //
const resolution = 30;   // 米
const zip_level= 2
const fileSize = calculateRasterSize(area, dataType, resolution,zip_level);
console.log("文件大小:", fileSize, "MB");
