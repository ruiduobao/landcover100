from gma import rasp
from gma import osf

ColorTable = {
            0:(255, 202, 0,255), 
                        1:(0, 153, 204,255), 
                                    2:(102, 255, 102,255),
                                    3:(255, 255, 255,255),            
              }
TIF_PATH=r"F:\landcover100_com_DB\crop\东北精细农作物2017-2019\东北作物分类17、18、19年_大豆、玉米、水稻"

TIFS=osf.FindPath(TIF_PATH)
for tif in TIFS:
    rasp.Basic.AddColorTable(tif,ColorTable = ColorTable)
