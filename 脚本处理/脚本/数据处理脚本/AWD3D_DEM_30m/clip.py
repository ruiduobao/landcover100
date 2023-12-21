import gma
from tqdm import tqdm
from gma import rasp
from osgeo import gdal

infile=r"F:\landcover100_com_DB\DEM\medium_resolution\AW3D30_V4\mosaic\AW3D3_30.tif"
outfile_CHINA=r"F:\landcover100_com_DB\DEM\medium_resolution\AW3D30_V4\mosaic\AW3D3_30_CHINA.tif"
SHP_PATH=r"F:\landcover100_com_DB\others\中国范围矢量\2023年省级.shp"

gma.rasp.Basic.Clip(infile, outfile_CHINA, SHP_PATH)