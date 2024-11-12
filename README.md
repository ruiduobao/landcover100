## 开发环境准备

node >=18
天地图申请 token

## 安装依赖

```
yarn
```

## 移除 mapboxgl 的 token 校验

安装完依赖之后进行移除。

```
yarn rmtk
```

## 本地开发

```
yarn dev
```

## 打包构建

```
yarn build
```

---

## 配置说明

1. baseUrl：请求的后台接口的基本路径
   本地开发直接请求 [https://www.landcover100.com/](https://www.landcover100.com)域名下接口会跨域。因此添加 api path， 在 devServer 进行转发重写路径。
   生产环境直接同域情况下，直接使用 `https://www.landcover100.com` 即可
2. BeiAnHao： 备案号
3. 其他：略

## 请求切片

由于切片也是放在`https://www.landcover100.com` ,开发环境也属于跨域访问， 使用浏览器插件 `Allow CORS` 开启允许跨域访问即可
