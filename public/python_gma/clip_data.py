# -*- coding: utf-8 -*-

import logging
import gma
import sys
from osgeo import gdal

# 配置日志记录
logging.basicConfig(filename='clip_dem.log', level=logging.INFO,format='%(asctime)s:%(levelname)s:%(message)s',encoding='utf-8')

def clip_dem(vector_data, input_raster, output_raster):

    try:
        logging.info(f"开始裁剪操作: 输入栅格={input_raster}, 输出栅格={output_raster}, 矢量数据={vector_data}")
        gma.rasp.Clip(input_raster, output_raster, vector_data)
        logging.info("裁剪操作成功完成")
        print("doneclip")
    except Exception as e:
        logging.error(f"裁剪操作发生错误: {e}")
        print(f"裁剪操作发生错误: {e}")

        raise

if __name__ == '__main__':
    vector_data = sys.argv[1]
    input_raster = sys.argv[2]
    output_raster = sys.argv[3]
    clip_dem(vector_data, input_raster, output_raster)



