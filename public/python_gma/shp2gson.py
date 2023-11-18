# -*- coding: utf-8 -*-

import logging
import sys
from gma import vesp

# 配置日志记录
logging.basicConfig(filename='shp2gson.log', level=logging.INFO,format='%(asctime)s:%(levelname)s:%(message)s',encoding='utf-8')

def shp2gson(InFile, OutFile):

    try:
        logging.info(f"开始shp2gson操作: 输入矢量={InFile}, 输出矢量={OutFile}")

        #GMA 2.0版本
        vesp.Basic.ToOtherFormat(InFile, OutFile, OutFormat = 'GeoJSON')
        logging.info("shp2gson操作成功完成")
        print("donecovert")
    except Exception as e:
        logging.error(f"shp2gson操作发生错误: {e}")
        print(f"kml2gson操作发生错误: {e}")

        raise

if __name__ == '__main__':
    InFile = sys.argv[1]
    OutFile = sys.argv[2]
    shp2gson(InFile, OutFile)