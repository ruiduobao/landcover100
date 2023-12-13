from gma import rasp
from gma import osf
from tqdm import tqdm
#对esri的数据先裁剪再镶嵌
import os

#列出文件夹下面的子文件夹
def list_subfolders(directory):
    subfolders = [f.path for f in os.scandir(directory) if f.is_dir()]
    return subfolders
def find_tif_files(directory):
    tif_files = [file for file in os.listdir(directory) if file.endswith('.tif')]
    return tif_files
#获取输出文件夹
def create_nested_subfolders(source_path, target_base_path):
    # 提取源路径中的最后两个要素
    last_two_elements = source_path.rstrip(os.sep).split(os.sep)[-2:]

    # 构建完整的目标路径
    full_target_path = os.path.join(target_base_path, *last_two_elements)

    # 如果目标路径不存在，则创建它
    if not os.path.exists(full_target_path):
        os.makedirs(full_target_path)
        print(f"Created folder: {full_target_path}")
    else:
        print(f"Folder already exists: {full_target_path}")
    name=last_two_elements[0]+"_"+last_two_elements[1]+".tif"
    return full_target_path,name

#添加颜色映射表
def add_tif_color(TIF_PATH):
    ColorTable = {
                1:(34,166,242,255)             
                }
    rasp.Basic.AddColorTable(TIF_PATH,ColorTable = ColorTable)
#裁剪
#输入文件夹
INPUT_DIR=r"F:\landcover100_com_DB\others\2016-2020年玉米\mosaic\\"

#输出路径
OUTPUT_PATH=r"F:\landcover100_com_DB\others\2016-2020年玉米\mosaic_wgs84\\"


tifs=osf.FindPath(INPUT_DIR)
for tif in tifs:
    name=tif.split("\\")[-1]
    output_file=OUTPUT_PATH+name
    rasp.Basic.Reproject(tif, output_file,4326)
    rasp.Basic.GenerateOVR(output_file)
    add_tif_color(output_file)

