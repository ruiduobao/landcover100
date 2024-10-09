from gma  import rasp 
from gma import osf
import os
from tqdm import tqdm

PATH=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\GLC_FCS\2021_2022\原始数据\GLC_FCS30D_20002022_筛选中国范围\\"

OutPath=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\GLC_FCS\2021_2022\原始数据\GLC_FCS30D_20002022_筛选中国范围_2022单波段\\"

SPILT_BAND=23

InFiles = osf.FindPath(PATH)

for InFile in tqdm(InFiles):
    # 获取文件名
    rasp.Decompose.BandDecomposition(InFile, OutPath=OutPath, Bands = SPILT_BAND)

# rasp.Decompose.SplitImage(InFile, OutPath, Size=256, Lap=0, FillValue=None)
