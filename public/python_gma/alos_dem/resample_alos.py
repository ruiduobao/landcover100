#更改alos数据的空值脚本
#批量设置栅格数据的nodata值
from osgeo import gdal
from tqdm import tqdm 
from gma import osf
from gma import rasp
import os
#列出文件夹下面的子文件夹
def list_subfolders(directory):
    subfolders = [f.path for f in os.scandir(directory) if f.is_dir()]
    return subfolders
def find_tif_files(directory):
    tif_files = [file for file in os.listdir(directory) if file.endswith('.tif')]
    return tif_files


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
def resample_TIF(InFile,OutFile):
    rasp.Basic.Resample(InFile, OutFile,100)
    create_pyramid(OutFile)

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
              OutFile=tif_to_mosaic.replace('.tif', '_resample_server.tif')
              resample_TIF(tif_to_mosaic,OutFile)
        except:
              print(tif_to_mosaic,"error")
