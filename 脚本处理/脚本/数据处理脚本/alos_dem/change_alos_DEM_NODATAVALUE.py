#更改alos数据的空值脚本
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
#修改值的函数
def change_ALOS_DEM_NODATA(file_PATH):
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
    xblocksize = xsize // 3
    yblocksize = ysize // 3

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
# 输入文件路径
INPUT_DIR= "F:/landcover100_com_DB/others/12.5m/各省DEM镶嵌"

Input_tif_years = list_subfolders(INPUT_DIR)
#`循环每一个年份`
for Input_tif_year in tqdm(Input_tif_years):
    #列出每个最底层文件夹所包含的tif
    tifs_to_mosaics=osf.FindPath(Input_tif_year)
    #列出行带号的每一个路径
    for tif_to_mosaic in tifs_to_mosaics:
        try: 
              change_ALOS_DEM_NODATA(tif_to_mosaic)
        except:
              print(tif_to_mosaic,"error")
