import pandas as pd
from tqdm import tqdm 
import os

# 读取CSV文件
PATH = r"E:\个人\网站备份\landcover100.com\脚本处理\行政区域数据\原始csv数据\\2.生成的数据位一到五级(含编码)2023.csv"
df = pd.read_csv(PATH)

# 按照省、市、县、乡的层次结构对数据进行排序
df = df.sort_values(['省', '市', '县', '乡'])

# 获取唯一的市列表
cities = df['市'].unique()

# 为每个市创建一个Markdown文件
for city in tqdm (cities):
    city_data = df[df['市'] == city]
    if not city_data.empty:
        city_code = str(city_data.iloc[0]['编码'])[:4] + "00"
        # 创建Markdown文件路径
        OUT_PATH = os.path.join(r"E:\个人\网站备份\landcover100.com\脚本处理\行政区域数据\markdown文件\市级", f"{city_code}.md")
        with open(OUT_PATH, "w", encoding="utf-8") as file:
            # 遍历县级单位
            for county, county_data in city_data.groupby('县'):
                county_code = str(county_data.iloc[0]['编码'])[:6]
                file.write(f"# {county} {county_code}\n")

                # 遍历乡级单位
                for town, town_data in county_data.groupby('乡'):
                    town_code = str(town_data.iloc[0]['编码'])
                    file.write(f"## {town} {town_code}\n")

                    # 遍历村级单位
                    for _, village_row in town_data.iterrows():
                        village = village_row['村']
                        # 确保village字段不是NaN
                        if pd.notna(village):
                            village_code = str(village_row['编码'])
                            # 构建完整的省市县乡村名
                            full_village_name = f"{village_row['省']}{village_row['市']}{village_row['县']}{village_row['乡']}{village}"
                            file.write(f"### {village} {full_village_name}\n")
    else:
        print(f"没有找到城市 {city} 的数据。")
