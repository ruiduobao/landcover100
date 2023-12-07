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
    input_raster1 = r"E:\百度网盘\1米土地覆盖\SinoLC-1\7711587东北\Northeast_Heilongjiang\Northeast_Heilongjiang_Daxinganling.tif"
    input_raster2 = r"F:\landcover100_com_DB\DEM\medium_resolution\TAN_DEM\\TAN_DEM.tif"
    vector_data1 = r"E:\下载\232721204000\请关注公众号遥感之家\\POLYGON.shp"
    vector_data2 = r"E:\下载\232721204000\请关注公众号遥感之家\\POLYGON.shp"
    output_raster1 = r"E:\下载\232721204000\请关注公众号遥感之家\\TAN_DEM12.tif"
    output_raster2 = r"E:\下载\232721204000\请关注公众号遥感之家\\TAN_DEM22.tif"

    # 裁剪第一个矢量数据
    clip_dem(vector_data1, input_raster1, output_raster1)

    # 裁剪第二个矢量数据
    clip_dem(vector_data2, input_raster2, output_raster2)
