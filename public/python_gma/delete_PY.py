import subprocess

def remove_pyramids(tif_path, gdaladdo_path):
    # 使用gdaladdo删除金字塔
    command = f'"{gdaladdo_path}" -clean "{tif_path}"'  
    subprocess.run(command, shell=True, check=True)

# 指定tif文件的路径和gdaladdo的完整路径
tif_file_path = r'F:\landcover100_com_DB\DEM\medium_resolution\TAN_DEM.tif'
gdaladdo_path = r"D:\Program Files\supermap\support\MiniConda\conda_mini\Lib\site-packages\osgeo\gdaladdo.exe"
remove_pyramids(tif_file_path, gdaladdo_path)