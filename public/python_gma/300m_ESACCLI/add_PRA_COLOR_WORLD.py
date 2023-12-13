import netCDF4 as nc
from osgeo import gdal, osr
import numpy as np

from osgeo import gdal
from tqdm import tqdm 
from gma import osf
from gma import rasp
import os


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
    rasp.Basic.AddColorTable(nc_to_covert,ColorTable = ColorTable)
    
#列出每个最底层文件夹所包含的tif
OUT_covertTIF_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\world_tif2\\"
OUT_covertTIF_PATH2=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\world_tif_compress\\"
ncs_to_covert=osf.FindPath(OUT_covertTIF_PATH)
for nc_to_covert in tqdm(ncs_to_covert):
    try:
        TIF_NAME=nc_to_covert.split("\\")[-1]
        TIF_PATH=OUT_covertTIF_PATH2+TIF_NAME
        rasp.Basic.Reproject(nc_to_covert, TIF_PATH,4326)
        add_tif_color(TIF_PATH)
        rasp.Basic.GenerateOVR(TIF_PATH)
    except:
        print(nc_to_covert,"error")
