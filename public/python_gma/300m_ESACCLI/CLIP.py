# -*- coding: utf-8 -*-

import logging
# import gma
from gma import rasp
import sys
from osgeo import gdal

# 配置日志记录
logging.basicConfig(filename='clip_dem.log', level=logging.INFO,format='%(asctime)s:%(levelname)s:%(message)s',encoding='utf-8')

def clip_dem(vector_data, input_raster, output_raster):

    try:
        logging.info(f"开始裁剪操作: 输入栅格={input_raster}, 输出栅格={output_raster}, 矢量数据={vector_data}")
        #GMA 1.0版本
        # gma.rasp.Clip(input_raster, output_raster, vector_data)
        #GMA 2.0版本
        rasp.Basic.Clip(input_raster, output_raster, vector_data,OutNoData =0,InNoData =0)
        rasp.Basic.GenerateOVR( output_raster)
        logging.info("裁剪操作成功完成")
        print("donecovert")
    except Exception as e:
        logging.error(f"裁剪操作发生错误: {e}")
        print(f"裁剪操作发生错误: {e}")

        raise

if __name__ == '__main__':
    INPUT_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\gdalwarp.tif"

    SHP_PATH=r"F:\landcover100_com_DB\others\中国范围矢量\2023年省级.shp"

    OUT_PATH=r"F:\landcover100_com_DB\Land_Cover\low_resolution\ESA_CCI_300m\class_CHINA_1992.tif"
    clip_dem(SHP_PATH,INPUT_PATH, OUT_PATH)



