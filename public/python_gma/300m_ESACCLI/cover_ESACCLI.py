from osgeo import gdal
import netCDF4 as nc

INPUT_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\ESACCI-LC-L4-LCCS-Map-300m-P1Y-1992-v2.0.7cds.nc"
OUTPUT_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\gdalwarp.tif"

#读取nc文件的波段信息

# 打开NetCDF文件
ds = nc.Dataset(INPUT_PATH, 'r')

# 打印文件的详细信息
print(ds)
# 打印lat和lon变量的详细信息
if 'lat' in ds.variables:
    lat = ds.variables['lat']
    print("Latitude (lat) variable details:")
    print(f"  Dimensions: {lat.dimensions}")
    print(f"  Size: {lat.size}")
    print(f"  DataType: {lat.dtype}")
    print(f"  Values range: [{lat[:].min()}, {lat[:].max()}]")
    print()

if 'lon' in ds.variables:
    lon = ds.variables['lon']
    print("Longitude (lon) variable details:")
    print(f"  Dimensions: {lon.dimensions}")
    print(f"  Size: {lon.size}")
    print(f"  DataType: {lon.dtype}")
    print(f"  Values range: [{lon[:].min()}, {lon[:].max()}]")
    print()
# 关闭文件
ds.close()


ds_in = gdal.Open('HDF5:"{}"://lccs_class'.format(INPUT_PATH))
ds_out = gdal.Warp(OUTPUT_PATH, ds_in, 
                   format = 'GTiff',
                   dstSRS = 'EPSG:4326',
                   outputBounds = [68, 20, 136,53],
                   outputBoundsSRS = 'EPSG:4326')

# if you want to check the result
print (gdal.Info(ds_out))

ds_out = None