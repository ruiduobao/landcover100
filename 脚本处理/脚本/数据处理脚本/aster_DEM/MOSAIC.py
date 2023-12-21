import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\DEM\medium_resolution\ASTER_DEM\TIFS"
outfile=r"F:\landcover100_com_DB\DEM\medium_resolution\ASTER_DEM\mosaic\Aster_DEM_CHINA.tif"
InFiles = gma.osf.FindPath(INPUT_DIR)
gma.rasp.Basic.Mosaic(InFiles,outfile)
gma.rasp.Basic.GenerateOVR(outfile)