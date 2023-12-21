import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\DEM\low_resolution\GTOP_DEM\tifs"
outfile=r"F:\landcover100_com_DB\DEM\low_resolution\GTOP_DEM\mosaic\GTOP_DEM_China.tif"
InFiles = gma.osf.FindPath(INPUT_DIR)
gma.rasp.Basic.Mosaic(InFiles,outfile)
