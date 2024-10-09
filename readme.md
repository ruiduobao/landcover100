## landcover100部署教程

## 简介：

landcover100是一个包括了完整的前端、后端、数据库和空间数据处理模块的代码仓库。主要信息如下：

1. 数据类型

   - 土地覆盖数据
   - DEM（数字高程模型）数据

2. 核心功能
    a. 地图展示

   - 使用 Amap 构建地图框架
   - 通过 GeoServer 展示空间数据

   b. 数据裁剪与下载

   - 前端发起空间数据请求
   - 后端接收矢量数据并使用 GDAL 工具裁剪
   - 提供裁剪后的数据下载

   c. 行政区划查询

   - 支持省市县乡四级空间数据查询和展示
   - 前端根据行政区划代码发起查询
   - PostGIS 返回相应地区矢量数据

   d. 数据处理与展示

   - 裁剪后的空间数据可直接下载
   - 通过 GeoServer 接口自动发布裁剪后的数据
   - 在前端展示发布的数据

3. 用户管理

   - 采用 Casdoor 进行用户管理
   - 支持多种注册方式（手机号、邮箱等）

4. 底图功能

   - 提供底图切换功能
   - 可选底图包括高德、星图地球等



## 网站架构：

该网站的前端使用Amap构建地图界面，通过express后端与各个组件交互：Postgis数据库提供空间数据和行政区划信息，GDAL处理空间数据，Geoserver负责数据发布和展示。用户管理由CASDOOR实现，用户数据存储在MySQL中。整个系统实现了从数据存储、处理、发布到用户交互的完整流程，支持地理数据的查询、可视化和下载，同时可进行用户信息管理。

![软件架构](http://pics.landcover100.com/i/2024/10/07/6703f27515f50.png)

## 部署环境：

由于该网站是集成项目，如果完整安装需要需要很多步骤。**建议只进行网页端安装，**开发时调用已有的API（api地址：https://www.landcover100.com/api-docs/#/）。空间数据库、casdoor用户管理、GDAL空间数据处理等模块可以使用我服务器上的。

首先下载GitHub项目：

```sh
git clone https://github.com/ruiduobao/landcover100.git
```



### 网页端安装：

1.下载并安装nodejs 16.20.0版本(https://nodejs.org/en/blog/release/v16.20.0)，

2.安装环境express环境，安装命令为：

```sh
npm install
```

3.配置目前的开发环境，目前有两个环境：一个是本地端环境(文件名：env.production)，一个是服务器部署端环境(文件名：.env.development)。根据相关注释配置对应路径。

![](http://pics.landcover100.com/i/2024/10/09/6706142a73853.png)

4.启动项目：

```
#使用哪个环境启动：
$env:NODE_ENV="production"
#启动项目
node app.js
```

![1728450302067.png](http://pics.landcover100.com/i/2024/10/09/67060f022553f.png)

启动完毕后，可看到前后端的页面：
![](http://pics.landcover100.com/i/2024/10/09/670614e9f3eeb.webp)

### 数据处理环境python安装：

1.在开发时，安装conda(https://www.anaconda.com/)；如果部署在服务器上，安装miniconda（https://docs.anaconda.com/miniconda/）。

2.使用conda创建一个python 3.10版本环境，名称为：GMA_envir

```python
conda create -n GMA_envir python=3.10
```

3.pip本地安装gdal（最好是.whl类型，防止安装失败，可以到这里下载：https://wheelhouse.openquake.org/v3/windows/py310/）

```sh
pip install F:/GDAL-3.4.3-cp310-cp310-win_amd64.whl
```

4.安装gma

```python
pip install gma
```

自此，python环境安装成功。该命令主要是运行5个python空间数据处理脚本，这些脚本主要用于栅格数据的裁剪、预计文件大小、面积计算等。

### 数据库端安装:

1.参考官方文档：https://postgis.net/workshops/postgis-intro/installation.html 安装postgis，安装最新版即可。

2.导入CTAmap的2023年省市县数据和乡镇矢量数据。

3.将postgis的数据库名称、账户密码等连接填入.env环境文件中。

### 用户信息的服务器端安装：

1.参考官网文档：https://casdoor.org/zh/ 使用docker安装casdoor。

2.配置casdoor网站相关信息，并导出密钥。

![](http://pics.landcover100.com/i/2024/10/09/670618c647f6b.png)

3.将casdoor_certificate.pem放到主目录下、将casdoor配置信息填入到.env环境文件中。



## 最后

如果只是开发网页，建议只安装网页端。

如果是自己想开发整体系统，按照上面的流程配置即可。

欢迎大家提交代码到该仓库。

做一个有趣、好玩的GIS小工具。



