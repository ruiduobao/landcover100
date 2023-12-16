

start_lan=10
end_lan=60

start_lon=70
end_lon=140

URL_1="https://storage.googleapis.com/earthenginepartners-hansen/GLCLU2000-2020/v2/2010/"
URL_2=".tif"
example="https://storage.googleapis.com/earthenginepartners-hansen/GLCLU2000-2020/v2/2015/60N_090E.tif"

step = 10

for lan in range(start_lan, end_lan + 1, step):
    for lon in range(start_lon, end_lon + 1, step):
        formatted_lan = str(lan)
        formatted_lon = str(lon).zfill(3)

        URL_NO =formatted_lan  + "N" +  "_"+formatted_lon +"E" 
        full_url = URL_1 + URL_NO+URL_2
        print(full_url)
