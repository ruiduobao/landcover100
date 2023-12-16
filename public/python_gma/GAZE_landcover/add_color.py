from gma import rasp
from gma import osf

ColorTable = {
            1:(255, 152, 0,255), 
            2:(38, 115, 0,255), 
            3:(112, 186, 0,255),
            4:(204, 204, 204,255), 
            5:(230, 230, 0,255), 
            6:(110, 110, 110,255), 
            7:(211, 255, 190,255),
            8:(204, 204, 204,255),  
            9:(168, 0, 0,255), 
            10:(168, 125, 0,255),
            11:(0,92, 230,255)          
              }
TIF_PATH=r"F:\landcover100_com_DB\Land_Cover\OTHERS\gaze\gaze_world.tif"


rasp.Basic.AddColorTable(TIF_PATH,ColorTable = ColorTable)
