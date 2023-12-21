from osgeo import gdal
import numpy as np
from tqdm import tqdm 
from gma import osf
import os

def replace_values_with_zero(input_file, output_file, values_to_replace):
    # 打开输入文件
    dataset = gdal.Open(input_file, gdal.GA_ReadOnly)

    if dataset is None:
        print("无法打开输入文件")
        return False

    # 获取栅格数据集的波段数
    num_bands = dataset.RasterCount

    # 打开输出文件
    driver = gdal.GetDriverByName("GTiff")
    output_dataset = driver.Create(output_file, dataset.RasterXSize, dataset.RasterYSize, num_bands, gdal.GDT_Int16)

    if output_dataset is None:
        print("无法创建输出文件")
        return False

    # 遍历每个波段
    for band_num in range(1, num_bands + 1):
        band = dataset.GetRasterBand(band_num)
        band_array = band.ReadAsArray()

        # 将指定的值更改为0
        for value in values_to_replace:
            band_array[band_array == value] = 0

        # 将修改后的数组写入输出文件
        output_band = output_dataset.GetRasterBand(band_num)
        output_band.WriteArray(band_array)

    # 设置输出文件的投影和地理信息
    output_dataset.SetProjection(dataset.GetProjection())
    output_dataset.SetGeoTransform(dataset.GetGeoTransform())

    # 关闭数据集
    dataset = None
    output_dataset = None

    print("处理完成")
    return True

# 使用示例
input_file = 'input.tif'
output_file = 'output.tif'
values_to_replace = [-32767, -999]

# 输入文件路径
INPUT_DIR= r"F:\landcover100_com_DB\DEM\high_resolution\ALOS_DEM_12.5m\geoserver\tifs\wgs84"

Input_tif_years =osf.FindPath(INPUT_DIR,EXT = '.tif')
#`循环每一个年份`
for Input_tif_year in tqdm(Input_tif_years):
            
            output_file=Input_tif_year.replace('.tif', '_changeNODATA.tif')

            if replace_values_with_zero(Input_tif_year, output_file, values_to_replace):
                print(f"已将{values_to_replace}替换为0，并保存到{output_file}")
            else:
                print("处理失败")
