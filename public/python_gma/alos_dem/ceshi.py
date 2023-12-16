# -*- coding: utf-8 -*-

import logging
from gma import rasp
import time

def clip_dem(vector_data, input_raster, output_raster):
    try:
        logging.info(f"开始裁剪操作: 输入栅格={input_raster}, 输出栅格={output_raster}, 矢量数据={vector_data}")
        start_time = time.time()  # 开始计时

        # GMA 2.0版本
        rasp.Basic.Clip(input_raster, output_raster, vector_data)

        end_time = time.time()  # 结束计时
        elapsed_time = end_time - start_time  # 计算耗时
        logging.info(f"裁剪操作成功完成，耗时: {elapsed_time} 秒")
        print(f"裁剪完成，耗时: {elapsed_time} 秒")
    except Exception as e:
        logging.error(f"裁剪操作发生错误: {e}")
        print(f"裁剪操作发生错误: {e}")
        raise

if __name__ == '__main__':
    input_raster1 = r"F:\landcover100_com_DB\Land_Cover\high_resolution\ESA_worldcover/ESA_Worldcover_China_2021.tif"
    input_raster2 = r"F:\landcover100_com_DB\Land_Cover\OTHERS\FROM-LC\FROM_LC_2017_CHINA.tif"
    vector_data1 = r"F:\keshan\shp_2KGr3R\POLYGON.shp"
    vector_data2 = r"F:\keshan\shp_2KGr3R\POLYGON.shp"
    output_raster1 = r"F:\keshan\shp_2KGr3R\ESA_Worldcover_China_2021.tif"
    output_raster2 = r"F:\keshan\shp_2KGr3R\湖南省.tif"

    # 裁剪第一个矢量数据
    clip_dem(vector_data1, input_raster1, output_raster1)

    # 裁剪第二个矢量数据
    clip_dem(vector_data2, input_raster2, output_raster2)
