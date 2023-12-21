from gma import rasp
from gma import osf

TIF_PATH="F:\landcover100_com_DB\others\2016-2020年玉米\mosaic"
#列出每个最底层文件夹所包含的tif
tifs_to_mosaic=osf.FindPath(Input_tif_year)

for tif_to_mosaic in tifs_to_mosaic:
    rasp.Basic.GenerateOVR(tif_to_mosaic)