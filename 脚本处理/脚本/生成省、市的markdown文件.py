import pandas as pd


# 从CSV文件读取数据
PATH = r"E:\个人\网站备份\landcover100.com\脚本处理\行政区域数据\原始csv数据\2.生成的数据位一到五级(含编码)2023.csv"

df = pd.read_csv(PATH)

# 按照省、市的层次结构对数据进行排序
df = df.sort_values(['省', '市'])

# 获取唯一的省份列表
provinces = df['省'].unique()

# 创建Markdown文档
OUT_PATH = r"E:\个人\网站备份\landcover100.com\脚本处理\行政区域数据\markdown文件\省市级.md"

with open(OUT_PATH, "w", encoding="utf-8") as file:
    for province in provinces:
        province_data = df[df['省'] == province]
        province_code = str(province_data.iloc[0]['编码'])[:2] + "0000"
        file.write(f"# {province} {province_code}\n")

        for city, city_data in province_data.groupby('市'):
            city_code = str(city_data.iloc[0]['编码'])[:4] + "00"
            file.write(f"## {city} {city_code}\n")
