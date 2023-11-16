# -*- coding: utf-8 -*-

import logging
import sys
from gma import vesp

# 配置日志记录
logging.basicConfig(filename='kml2gson.log', level=logging.INFO,format='%(asctime)s:%(levelname)s:%(message)s',encoding='utf-8')

def kml2gson(InFile, OutFile):

    try:
        logging.info(f"开始kml2gson操作: 输入矢量={InFile}, 输出栅格={OutFile}")

        #GMA 2.0版本
        vesp.Basic.ToOtherFormat(InFile, OutFile, OutFormat = 'GeoJSON')
        logging.info("kml2gson操作成功完成")
        print("doneclip")
    except Exception as e:
        logging.error(f"kml2gson操作发生错误: {e}")
        print(f"kml2gson操作发生错误: {e}")

        raise

if __name__ == '__main__':
    InFile = sys.argv[1]
    OutFile = sys.argv[2]
    clip_dem(InFile, OutFile)