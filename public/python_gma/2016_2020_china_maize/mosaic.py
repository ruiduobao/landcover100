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

#裁剪
#输入文件夹
INPUT_DIR=r"F:\landcover100_com_DB\others\2016-2020年玉米\2016-2020年玉米"

#输出路径
OUTPUT_PATH=r"F:\landcover100_com_DB\others\2016-2020年玉米\mosaic\\"


Input_tif_years = list_subfolders(INPUT_DIR)

#`循环每一个年份`
for Input_tif_year in tqdm(Input_tif_years):
    try:
        #列出每个最底层文件夹所包含的tif
        tifs_to_mosaic=osf.FindPath(Input_tif_year)

        OUTPUT_Name=Input_tif_year.split("\\")[-1]+"_China_Maize.tif"
        OUTPUT_file_PATH=OUTPUT_PATH+OUTPUT_Name

        rasp.Basic.Mosaic(tifs_to_mosaic,OUTPUT_file_PATH, InNoData = 0, OutNoData = 0)
        # #镶嵌的输出路径
        # output_file_path,NAME=create_nested_subfolders(Input_tif_year_folder, OUTPUT_PATH)
        # output_file_name=output_file_path+"\\"+NAME
        # rasp.Basic.Mosaic(tifs_to_mosaic,output_file_name, InNoData = 0, OutNoData = 0)
    except:
        print("error",Input_tif_year)