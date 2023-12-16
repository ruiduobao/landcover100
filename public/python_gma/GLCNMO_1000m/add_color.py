from gma import rasp
from gma import osf

ColorTable = {
            1:(21, 55, 21,255), 
            2:(57, 149,65,255), 
            3:(0, 160, 49,255),
            4:(85, 139, 52,255), 
            5:(57, 180, 65,255), 
            6:(139, 189, 139,255), 
            7:(189, 189, 49,255),
            8:(246, 246, 50,255),  
            9:(180, 213, 100,255), 
            10:(168, 125, 0,255),
            11:(252,175, 82,255),
            12:(100, 80, 100,255), 
            13:(190, 160, 180,255),
            14:(140, 130, 180,255), 
            15:(180, 220, 234,255), 
            16:(150, 150, 150,255), 
            17:(200, 200, 200,255),
            18:(255, 0, 0,255),  
            19:(255, 255, 255,255), 
            20:(170, 200, 240,255)        
              }
outfile=r"F:\landcover100_com_DB\Land_Cover\low_resolution\GLCNMO_1000m\mosaic\GLCNMO_1000m_V3.tif"


rasp.Basic.AddColorTable(outfile,ColorTable = ColorTable)