from gma import rasp
from osgeo import gdal
from tqdm import tqdm 
from gma import osf

INPUT_DIR=r"F:\landcover100_com_DB\DEM\high_resolution\ALOS_DEM_12.5m\geoserver\tifs\covert_TOw_gs84"
output_dir=r"F:\landcover100_com_DB\DEM\high_resolution\ALOS_DEM_12.5m\geoserver\tifs\wgs84\\"

Input_tif_years = osf.FindPath(INPUT_DIR,EXT = '.tif')
for Input_tif_year in tqdm(Input_tif_years):
    NAME=Input_tif_year.split("\\")[-1]

    OutFile=output_dir+NAME

    rasp.Basic.Reproject(Input_tif_year, OutFile,4326)
