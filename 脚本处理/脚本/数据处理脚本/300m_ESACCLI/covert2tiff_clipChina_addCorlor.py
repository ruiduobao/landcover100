#将NC转为tif，然后裁剪，添加颜色映射表
import netCDF4 as nc
from osgeo import gdal, osr
import numpy as np

from osgeo import gdal
from tqdm import tqdm 
from gma import osf
from gma import rasp
import os

#发现文件
def find_tif_files(directory):
    tif_files = [file for file in os.listdir(directory) if file.endswith('.nc')]
    return tif_files
#将nc转为有坐标的tif
def covert2tif(nc_file,output_tiff):
    # 打开 NetCDF 文件
    ds_nc = nc.Dataset(nc_file)

    # 获取 lat, lon 和 lccs_class 数据
    lat = ds_nc.variables['lat'][:]
    lon = ds_nc.variables['lon'][:]
    lccs_class = ds_nc.variables['lccs_class'][0, :, :]  # 假设 time 维度为第一个维度

    # 创建一个新的 TIFF 文件
    driver = gdal.GetDriverByName('GTiff')
    options = ['COMPRESS=LZW']
    ds_tiff = driver.Create(output_tiff, len(lon), len(lat), 1, gdal.GDT_Byte, options)

    # 设置地理变换和投影
    # 注意：这里的计算基于 lat 和 lon 变量是规则且等间隔的假设
    delta_lat = abs(lat[1] - lat[0])
    delta_lon = abs(lon[1] - lon[0])
    geotransform = (lon.min(), delta_lon, 0, lat.max(), 0, -delta_lat)
    ds_tiff.SetGeoTransform(geotransform)

    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)  # WGS84
    ds_tiff.SetProjection(srs.ExportToWkt())

    # 将 lccs_class 数据写入 TIFF
    ds_tiff.GetRasterBand(1).WriteArray(lccs_class)

    # 清理资源
    ds_tiff = None
    ds_nc.close()

#添加颜色映射表
def add_tif_color(TIF_PATH):
    ColorTable = {
                10:(255,255,100,255), 
                            11:(255,255,100,255), 
                                        12:(255,255,100,255), 
                20:(170,240,240,255), 
                30:(220,240,100,255), 
                40:(200,200,100,255), 
                50:(0,100,0,255), 
                60:(0,160,0,255), 
                            61:(0,160,0,255), 
                                        62:(0,160,0,255), 
                70:(0,60,0,255), 
                            71:(0,60,0,255), 
                                        72:(0,60,0,255), 
                80:(40,80,0,255), 
                            81:(40,80,0,255), 
                                        82:(40,80,0,255), 
                82:(40,100,0,255), 
                90:(120,130,0,255),
                100:(140,160,0,255), 
                110:(190,150,0,255),
                120:(150,100,0,255), 
                                121:(150,100,0,255),
                                            122:(150,100,0,255),
                121:(150,100,0,255),
                122:(150,100,0,255), 
                130:(255,180,50,255),
                140:(255,220,210,255), 
                150:(255,235,175,255),
                151:(255,250,100,255), 
                152:(255,210,120,255),
                153:(255,235,175,255), 
                160:(0,120,90,255),
                170:(0,150,120,255), 
                180:(0,220,130,255),
                190:(195,20,0,255), 
                200:(255,245,215,255),
                201:(220,220,220,255),
                202:(255,245,215,255), 
                210:(0,70,200,255),
                220:(255,255,255,255), 
                200:(255,245,215,255),              
                }
    rasp.Basic.AddColorTable(TIF_PATH,ColorTable = ColorTable)

#列出每个最底层文件夹所包含的tif
INPUT_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\NC_ini2"
OUT_covertTIF_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\world_tif2\\"
OUT_clipChina_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\china_esa_cci\\"

SHP_PATH=r"F:\landcover100_com_DB\others\中国范围矢量\2023年省级.shp"


ncs_to_covert=osf.FindPath(INPUT_PATH)
for nc_to_covert in tqdm(ncs_to_covert):
    # try:
        TIF_NAME=nc_to_covert.split("\\")[-1].replace('.nc', '.tif')
        TIF_PATH=OUT_covertTIF_PATH+TIF_NAME
        print(TIF_PATH)
        # #转为tif
        covert2tif(nc_to_covert,TIF_PATH)
        add_tif_color(TIF_PATH)
        rasp.Basic.GenerateOVR(TIF_PATH)
        #裁剪
        # #输出文件
        # TIF_CLIP_PATH=OUT_clipChina_PATH+TIF_NAME
        # print(TIF_CLIP_PATH)
        # rasp.Basic.Clip(TIF_PATH, TIF_CLIP_PATH, SHP_PATH,OutNoData =0,InNoData =0)
        # #添加颜色映射表
        # add_tif_color(TIF_CLIP_PATH)
    # except:
    #     print("error",nc_to_covert)

