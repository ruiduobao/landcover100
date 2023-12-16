import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\Land_Cover\OTHERS\FROM-LC\2017\分省"
outfile=r"F:\landcover100_com_DB\Land_Cover\OTHERS\FROM-LC\MOSAIC\FROM_LC_2017_CHINA.tif"
InFiles = gma.osf.FindPath(INPUT_DIR)
gma.rasp.Basic.Mosaic(InFiles,outfile, InNoData = 0, OutNoData = 0)
gma.rasp.Basic.GenerateOVR(outfile)