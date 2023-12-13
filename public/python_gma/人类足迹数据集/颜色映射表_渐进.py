from osgeo import gdal

# 打开栅格图像文件
input_file = 'F:\landcover100_com_DB\others\人类足迹数据集\keshan\hfp2000_CHINA.tif'  # 替换为你的输入文件路径
output_file = 'F:\landcover100_com_DB\others\人类足迹数据集\keshan\hfp2000_CHINA_COLOR.tif'  # 替换为你的输出文件路径
dataset = gdal.Open(input_file, gdal.GA_ReadOnly)

# 获取栅格图像的元数据
width = dataset.RasterXSize
height = dataset.RasterYSize
num_bands = dataset.RasterCount

# 读取栅格图像数据为数组
data = dataset.ReadAsArray()


# 获取栅格图像的元数据
width = dataset.RasterXSize
height = dataset.RasterYSize
num_bands = dataset.RasterCount

# 定义颜色映射范围和渐变色
min_value = 0  # 最小数值
max_value = 50  # 最大数值
start_color = (60, 151, 75)  
end_color = (218,37,34)    

# 创建颜色映射表
color_map = gdal.ColorTable()

for i in range(256):
    normalized_value = i / (max_value-min_value)
    r = int(start_color[0] * (1 - normalized_value) + end_color[0] * normalized_value)
    g = int(start_color[1] * (1 - normalized_value) + end_color[1] * normalized_value)
    b = int(start_color[2] * (1 - normalized_value) + end_color[2] * normalized_value)

    if i < 0:
        r, g, b = 255, 255, 255  # 超出范围的值设为白色
    if i > 50:
        r, g, b = 255, 255, 255  # 超出范围的值设为白色
    color_map.SetColorEntry(i, (r, g, b))

# 创建输出数据集
output_driver = gdal.GetDriverByName('GTiff')
output_dataset = output_driver.Create(output_file, width, height, num_bands, gdal.GDT_Byte)
output_dataset.SetGeoTransform(dataset.GetGeoTransform())
output_dataset.SetProjection(dataset.GetProjection())

for band_num in range(num_bands):
    band_data = dataset.GetRasterBand(band_num + 1).ReadAsArray()
    band_out = output_dataset.GetRasterBand(band_num + 1)
    band_out.SetColorTable(color_map)
    band_out.WriteArray(band_data)

# 关闭数据集
dataset = None
output_dataset = None

print("颜色映射已应用并保存到输出文件。")