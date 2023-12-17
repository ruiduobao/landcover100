from gma import osf

url=r"F:\landcover100_com_DB\DEM\high_resolution\ALOS_DEM_12.5m\TIF"
PATHs=osf.FindPath(url)

for PATH in PATHs:
    NAME=PATH.split("\\")[-1]
    NAME1=NAME.replace('.tif', '')
    PATH_OUTPUT="/mnt/yundisk/landcover100DB/DEM/high_resolution/alos_dem/"+NAME1+"/"+NAME
    print(PATH_OUTPUT)