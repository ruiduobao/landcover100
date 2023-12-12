import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\Land_Cover\high_resolution\ESRI_worldcover\2017-2021年全国土地利用分类数据（精度为10m）\2017\4244"
outfile=r"F:\landcover100_com_DB\Land_Cover\high_resolution\ESRI_worldcover\2017-2021年全国土地利用分类数据（精度为10m）\mosaic\2017/2017_MOSAIC_4244.tif"
InFiles = gma.osf.FindPath(INPUT_DIR,EXT = '.tif')
gma.rasp.Basic.Mosaic(InFiles,outfile, InNoData = 0, OutNoData = 0)
gma.rasp.Basic.GenerateOVR(outfile)