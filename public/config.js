//矢量文件的绝对路径
const VECTOR_DIR_PATH = '/www/wwwroot/landcover100/public';
//栅格文件保存的绝对路径
const RASTER_OUTPUT_DIR_PATH = '/www/wwwroot/landcover100/public/raster_output_fromDB/';
//栅格文件数据库保存的路径 (暂时未使用)
const Absolute_path = 'Absolute_path';
// 允许下载的最大文件大小
const MAX_ALLOWED_SIZE = 100;

window.SNConfig = {
  BeiAnHao: '蜀ICP备20011108号-1',
  baseUrl: 'http://localhost:5173/api',
  VECTOR_DIR_PATH,
  RASTER_OUTPUT_DIR_PATH,
  Absolute_path,
  MAX_ALLOWED_SIZE,
  tiandituToken: '', //地图服务token
  geocoderToken: '', // geocodertoken
  casdoorSdkSetting: {
    serverUrl: 'https://door.casdoor.com',
    clientId: '294b09fbc17f95daf2fe',
    organizationName: 'casbin',
    appName: 'app-vue-python-example',
    redirectPath: '/callback',

    // serverUrl: 'https://login.landcover100.com',
    // clientId: '2ad095dec6ed461cdf87',
    // organizationName: 'RuiduobaoOrganization',
    // appName: 'LandCover100APP',
    // redirectPath: '/callback',
  },
};
