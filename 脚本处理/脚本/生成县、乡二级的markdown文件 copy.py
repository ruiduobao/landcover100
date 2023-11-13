import pandas as pd
from tqdm import tqdm
import os

# 读取CSV文件
PATH = r"E:\个人\网站备份\landcover100.com\脚本处理\行政区域数据\原始csv数据\2.生成的数据位一到五级(含编码)2023.csv"
df = pd.read_csv(PATH)

# 按照省、市、县、乡的层次结构对数据进行排序
df = df.sort_values(['省', '市', '县', '乡'])

# 获取唯一的县列表
counties = df['县'].unique()

# 为每个县创建一个Markdown文件
for county in tqdm(counties):
    county_data = df[df['县'] == county]
    if not county_data.empty:
        county_code = str(county_data.iloc[0]['编码'])[:6]
        # 创建Markdown文件路径
        OUT_PATH = os.path.join(r"E:\个人\网站备份\landcover100.com\脚本处理\行政区域数据\markdown文件\县级", f"{county_code}.md")
        with open(OUT_PATH, "w", encoding="utf-8") as file:
            # file.write(f"# {county} {county_code}\n")
            
            # 遍历乡级单位
            for town, town_data in county_data.groupby('乡'):
                if pd.notna(town):  # 确保乡字段不是NaN
                    town_code = str(town_data.iloc[0]['编码'])
                    file.write(f"# {town} {town_code}\n")
    else:
        print(f"没有找到县 {county} 的数据。")
