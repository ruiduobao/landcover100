import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\DEM\medium_resolution\中国地区NASA DEM 30m数据\hgt"
outfile=r"F:\landcover100_com_DB\DEM\medium_resolution\中国地区NASA DEM 30m数据\mosaic\NASA_DEM_CHINA.tif"
InFiles = gma.osf.FindPath(INPUT_DIR)
gma.rasp.Basic.Mosaic(InFiles,outfile)
gma.rasp.Basic.GenerateOVR(outfile)