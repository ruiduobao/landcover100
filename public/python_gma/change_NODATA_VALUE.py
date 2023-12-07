from osgeo import gdal
from tqdm import tqdm 

# 输入文件路径
file_PATH = "F:\landcover100_com_DB\DEM\medium_resolution\SRTM_v3_DEM\mosaic\SRTM_v3_DEM_MOSAIC - 副本.tif"

# 打开文件
dataset = gdal.Open(file_PATH, gdal.GA_Update)

# 获取到第一个波段
band = dataset.GetRasterBand(1)

# 获取当前的nodata值
nodata = band.GetNoDataValue()

# 获取影像的尺寸
xsize = band.XSize
ysize = band.YSize

# 定义块的大小（将数据集分割为4个块）
xblocksize = xsize // 2
yblocksize = ysize // 2

# 循环遍历所有的块
for i in tqdm(range(2)):
    for j in tqdm(range(2)):
        # 计算块的范围
        xoff = i * xblocksize
        yoff = j * yblocksize
        xcount = min(xblocksize, xsize - xoff)
        ycount = min(yblocksize, ysize - yoff)

        # 读取块的数据
        data = band.ReadAsArray(xoff, yoff, xcount, ycount)

        # 把nodata值替换为-999
        data[data == nodata] = 0

        # 将数据写回波段
        band.WriteArray(data, xoff, yoff)

        # 打印进度
        print(f"Processed block {(i * 2 + j) + 1} of 4")

# 设置新的nodata值为-999
band.SetNoDataValue(-999)

# 将更改保存到文件
dataset.FlushCache()

# 关闭文件
dataset = None