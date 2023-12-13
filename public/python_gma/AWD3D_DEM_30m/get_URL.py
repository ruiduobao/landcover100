

start_lan=70
end_lan=140

start_lon=15
end_lon=55

URL_1="https://www.eorc.jaxa.jp/ALOS/aw3d30/data/release_v2303/"
URL_2=".zip"
example="https://www.eorc.jaxa.jp/ALOS/aw3d30/data/release_v2303/N025E105_N030E110.zip"

step = 5

for lan in range(start_lan, end_lan + 1, step):
    for lon in range(start_lon, end_lon + 1, step):
        formatted_lan = str(lan).zfill(3)
        formatted_lon = str(lon).zfill(3)
        # print(f"lan: {formatted_lan}, lon: {formatted_lon}")
        formatted_lan2 = str(lan + step).zfill(3)
        formatted_lon2 = str(lon + step).zfill(3)
        URL_NO = "N" + formatted_lon + "E" + formatted_lan + "_" + "N" + formatted_lon2 + "E" + formatted_lan2 + ".zip"
        full_url = URL_1 + URL_NO
        print(full_url)
