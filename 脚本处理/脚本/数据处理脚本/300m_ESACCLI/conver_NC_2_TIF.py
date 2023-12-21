import netCDF4 as nc
from osgeo import gdal, osr
import numpy as np

# 文件路径

nc_file =r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\ESACCI-LC-L4-LCCS-Map-300m-P1Y-1992-v2.0.7cds.nc"
output_tiff=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\gdalwarp.tif"
# 打开 NetCDF 文件
ds_nc = nc.Dataset(nc_file)

# 获取 lat, lon 和 lccs_class 数据
lat = ds_nc.variables['lat'][:]
lon = ds_nc.variables['lon'][:]
lccs_class = ds_nc.variables['lccs_class'][0, :, :]  # 假设 time 维度为第一个维度

# 创建一个新的 TIFF 文件
driver = gdal.GetDriverByName('GTiff')
ds_tiff = driver.Create(output_tiff, len(lon), len(lat), 1, gdal.GDT_Byte)

# 设置地理变换和投影
# 注意：这里的计算基于 lat 和 lon 变量是规则且等间隔的假设
delta_lat = abs(lat[1] - lat[0])
delta_lon = abs(lon[1] - lon[0])
geotransform = (lon.min(), delta_lon, 0, lat.max(), 0, -delta_lat)
ds_tiff.SetGeoTransform(geotransform)

srs = osr.SpatialReference()
srs.ImportFromEPSG(4326)  # WGS84
ds_tiff.SetProjection(srs.ExportToWkt())

# 将 lccs_class 数据写入 TIFF
ds_tiff.GetRasterBand(1).WriteArray(lccs_class)

# 清理资源
ds_tiff = None
ds_nc.close()
