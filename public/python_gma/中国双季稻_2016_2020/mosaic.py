from gma import rasp
from gma import osf
from tqdm import tqdm
#对esri的数据先裁剪再镶嵌
import os

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
def progress_callback(complete, message, unknown):
    """
    Callback function to display progress.
    """
    # complete is a float between 0 and 1 representing the progress
    print(f"Progress: {complete*100:.2f}%", end="\r")
    return 1  # Returning 1 continues the operation, returning 0 cancels

def create_pyramid(tif_file):
    """
    Function to add pyramid layers to a TIFF file using GDAL.
    
    Args:
    tif_file (str): Path to the TIFF file.
    
    Returns:
    str: Message indicating the success or failure of the operation.
    """
    try:
        # Open the dataset
        dataset = gdal.Open(tif_file, gdal.GA_Update)

        # Check if the dataset is valid
        if dataset is None:
            return "Failed to open the TIFF file."

        # Generate pyramid layers
        resampling_method = 'average'
        pyramid_levels = [2, 4, 8, 16]
        
        gdal.SetConfigOption('COMPRESS_OVERVIEW', 'LZW')
        dataset.BuildOverviews(resampling_method, pyramid_levels, callback=progress_callback)

        # Close the dataset
        dataset = None

        return "Pyramid layers added successfully to the TIFF file."
    except Exception as e:
        return f"An error occurred: {e}"
#裁剪
ColorTable = {
                        1:(0, 153, 204,255) 
              }
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
INPUT_DIR=r"F:\landcover100_com_DB\crop\中国双季稻_2016_2020\原始数据\\"

#输出路径
OUTPUT_PATH=r"F:\landcover100_com_DB\crop\中国双季稻_2016_2020\mosaic\\"


Input_tif_years = list_subfolders(INPUT_DIR)

#`循环每一个年份`
for Input_tif_year in tqdm(Input_tif_years):
    try:
        #列出每个最底层文件夹所包含的tif
        tifs_to_mosaic=osf.FindPath(Input_tif_year)

        OUTPUT_Name=Input_tif_year.split("\\")[-1]+"_Double_Season_Paddy.tif"
        OUTPUT_file_PATH=OUTPUT_PATH+OUTPUT_Name

        rasp.Basic.Mosaic(tifs_to_mosaic,OUTPUT_file_PATH, InNoData = 0, OutNoData = 0)
        result = create_pyramid(OUTPUT_file_PATH)
        rasp.Basic.AddColorTable(OUTPUT_file_PATH,ColorTable = ColorTable)
        # #镶嵌的输出路径
        # output_file_path,NAME=create_nested_subfolders(Input_tif_year_folder, OUTPUT_PATH)
        # output_file_name=output_file_path+"\\"+NAME
        # rasp.Basic.Mosaic(tifs_to_mosaic,output_file_name, InNoData = 0, OutNoData = 0)
    except:
        print("error",Input_tif_year)