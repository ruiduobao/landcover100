# -*- coding: utf-8 -*-
# calculate_area.py

from osgeo import ogr, osr
import sys

def calculate_area_albers_projection(geojson_file):
    # 打开 GeoJSON 文件
    dataSource = ogr.Open(geojson_file)
    layer = dataSource.GetLayer()

    # 创建一个 Albers 等面积投影的坐标参考系统
    albers_srs = osr.SpatialReference()
    albers_srs.ImportFromProj4('+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=120 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs')

    # 创建转换器，将几何体从原始坐标系转换到 Albers 投影坐标系
    transform = osr.CoordinateTransformation(layer.GetSpatialRef(), albers_srs)

    # 计算面积
    total_area = 0
    for feature in layer:
        geom = feature.GetGeometryRef()
        geom_clone = geom.Clone()
        geom_clone.Transform(transform)
        total_area += geom_clone.GetArea()

    # 清理
    dataSource = None
    #面积转为平方米
    total_area=total_area/1_000_000
    return total_area

if __name__ == '__main__':
    # 从命令行参数获取 GeoJSON 文件路径
    geojson_file_path = sys.argv[1]
    area = calculate_area_albers_projection(geojson_file_path)
    print(area)  # 将计算结果打印到标准输出
