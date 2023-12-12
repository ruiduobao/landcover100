from gma import rasp
from gma import osf
import os
from tqdm import tqdm
#对esri的数据先裁剪再镶嵌

#裁剪
#输入文件夹
INPUT_DIR=r"F:\landcover100_com_DB\Land_Cover\high_resolution\ESRI_worldcover\2017-2021年全国土地利用分类数据（精度为10m）\2021"
#待裁剪的矢量文件路径
SHP_PATH=r"F:\landcover100_com_DB\Land_Cover\high_resolution\ESRI_worldcover\2017-2021年全国土地利用分类数据（精度为10m）\矢量\2023年省级.shp"
#输出路径
OUTPUT_PATH=r"F:\landcover100_com_DB\Land_Cover\high_resolution\ESRI_worldcover\2017-2021年全国土地利用分类数据（精度为10m）\mosaic\2017_clip\\"

InFiles = osf.FindPath(INPUT_DIR,EXT = '.tif')
for InFile in tqdm(InFiles):
    print(InFile)
    # 从路径中提取文件名
    file_name = os.path.basename(InFile)
    output_raster=OUTPUT_PATH+file_name
    rasp.Basic.Clip(InFile, output_raster, SHP_PATH)