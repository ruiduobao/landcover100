#批量设置栅格数据的nodata值
from osgeo import gdal
from tqdm import tqdm 
from gma import osf
import os
#列出文件夹下面的子文件夹
def list_subfolders(directory):
    subfolders = [f.path for f in os.scandir(directory) if f.is_dir()]
    return subfolders
def find_tif_files(directory):
    tif_files = [file for file in os.listdir(directory) if file.endswith('.tif')]
    return tif_files

# 输入文件路径
INPUT_DIR= "F:\landcover100_com_DB\crop\China_Crop_2000_2015"

Input_tif_years = list_subfolders(INPUT_DIR)
#`循环每一个年份`
for Input_tif_year in tqdm(Input_tif_years):
    #列出每个最底层文件夹所包含的tif
    tifs_to_mosaics=osf.FindPath(Input_tif_year)
    #列出行带号的每一个路径
    for tif_to_mosaic in tifs_to_mosaics:

        # 打开文件
        dataset = gdal.Open(tif_to_mosaic, gdal.GA_Update)

        # 获取到第一个波段
        band = dataset.GetRasterBand(1)

        # 设置新的nodata值为-999
        band.SetNoDataValue(0)

        # 将更改保存到文件
        dataset.FlushCache()

        # 关闭文件
        dataset = None