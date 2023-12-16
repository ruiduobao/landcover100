import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\Land_Cover\low_resolution\GLCNMO_1000m\tifs"
outfile=r"F:\landcover100_com_DB\Land_Cover\low_resolution\GLCNMO_1000m\mosaic\GLCNMO_1000m_V3.tif"
InFiles = gma.osf.FindPath(INPUT_DIR)
gma.rasp.Basic.Mosaic(InFiles,outfile)
gma.rasp.Basic.GenerateOVR(outfile)