#裁剪人类足迹数据

#批量设置栅格数据的nodata值
from osgeo import gdal
from tqdm import tqdm 
from gma import osf
from gma import rasp
import os
#找到文件夹中的文件名
def find_tif_files(directory):
    tif_files = [file for file in os.listdir(directory) if file.endswith('.tif')]
    return tif_files
#列出每个最底层文件夹所包含的tif
INPUT_PATH="F:\landcover100_com_DB\others\人类足迹数据集\world_data"

SHP_PATH=r"F:\landcover100_com_DB\others\中国范围矢量\2023年省级.shp"

OUT_PATH=r"F:\landcover100_com_DB\others\人类足迹数据集\china_data\\"

tifs_to_mosaics=osf.FindPath(INPUT_PATH)
for tif_to_mosaics in tqdm(tifs_to_mosaics):
    output_raster=tif_to_mosaics.replace('.tif', '_CHINA.tif').replace('world_data', 'keshan')
    rasp.Basic.Clip(tif_to_mosaics, output_raster, SHP_PATH)
    #坐标转换
    output_raster2=output_raster.replace('keshan', 'china_data')
    rasp.Basic.Reproject(output_raster, output_raster2,4326)




