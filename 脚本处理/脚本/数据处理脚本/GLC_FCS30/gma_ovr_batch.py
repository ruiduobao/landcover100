import gma
from tqdm import tqdm

INPUT_DIR=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\GLC_FCS\2021_2022\原始数据\GLC_FCS30D_20002022_筛选中国范围_2021单波段"
InFiles = gma.osf.FindPath(INPUT_DIR)

for InFile in tqdm(InFiles):
    gma.rasp.Basic.GenerateOVR(InFile)
