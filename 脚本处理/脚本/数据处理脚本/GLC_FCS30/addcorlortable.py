from gma import rasp

ColorTable = {
    10: (255, 255, 100, 255),
    11: (255, 255, 10, 255),
    12: (255, 255, 0, 255),
    20: (170, 240, 240, 255),
    51: (76, 115, 0, 255),
    52: (0, 100, 0, 255),
    61: (170, 200, 0, 255),
    62: (0, 160, 0, 255),
    71: (0, 80, 0, 255),
    72: (0, 60, 0, 255),
    81: (40, 100, 0, 255),
    82: (40, 80, 0, 255),
    91: (160, 180, 50, 255),
    92: (120, 130, 0, 255),
    120: (150, 100, 0, 255),
    121: (150, 75, 0, 255),
    122: (150, 100, 0, 255),
    130: (255, 180, 50, 255),
    140: (255, 220, 210, 255),
    150: (255, 235, 175, 255),
    152: (255, 210, 120, 255),
    153: (255, 235, 175, 255),
    180: (0, 220, 130, 255),
    190: (195, 20, 0, 255),
    200: (255, 245, 215, 255),
    201: (220, 220, 220, 255),
    202: (255, 245, 215, 255),
    210: (0, 70, 200, 255),
    220: (255, 255, 255, 255),
    250: (255, 255, 255, 255)
}

TIF_PATH=r"F:\landcover100_com_DB\Land_Cover\medium_resolution\GLC_FCS\2021_2022\2021年GLC_FCS30米全国土地覆盖数据.tif"
rasp.Basic.AddColorTable(TIF_PATH,ColorTable = ColorTable)