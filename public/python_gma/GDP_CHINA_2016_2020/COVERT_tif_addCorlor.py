from gma import rasp
from gma import osf


input_file=r"F:\landcover100_com_DB\others\中国GDP\img格式"
output_path=r"F:\landcover100_com_DB\others\中国GDP\tif"

ColorTable = {
                        1:(0, 153, 204,255) 
              }

InFiles = osf.FindPath(input_file)

for InFile in InFiles:

    output_file=InFile.split("\\")[-1].replace('.img', '.tif')

    output_file=output_path+"\\"+output_file

    rasp.Basic.Reproject(InFile, output_file,4326)


