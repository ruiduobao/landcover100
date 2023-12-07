import gma
from tqdm import tqdm

INPUT_DIR=r"F:/landcover100_com_DB/DEM/medium_resolution/SRTM_v3_DEM/原始数据"
outfile=r"F:/landcover100_com_DB/DEM/medium_resolution/SRTM_v3_DEM/mosaic/SRTM_v3_DEM_MOSAIC.tif"
InFiles = gma.osf.FindPath(INPUT_DIR,EXT = '.tif')
gma.rasp.Basic.Mosaic(InFiles,outfile, InNoData = 0, OutNoData = 0)
gma.rasp.Basic.GenerateOVR(outfile)