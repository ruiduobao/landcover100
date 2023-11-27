// Copyright 2023 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const url = require('url')
const { SDK } = require('casdoor-nodejs-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

//设置网址（本地环境和服务器环境）
const Server_URL="http://localhost:3003"
const port = 3003;
// const Server_URL='https://www.landcover100.com'


const cert = `
-----BEGIN CERTIFICATE-----
MIIE2TCCAsGgAwIBAgIDAeJAMA0GCSqGSIb3DQEBCwUAMCYxDjAMBgNVBAoTBWFk
bWluMRQwEgYDVQQDDAtjZXJ0X2ZhYzhxNjAeFw0yMzExMjExOTE2MjRaFw00MzEx
MjExOTE2MjRaMCYxDjAMBgNVBAoTBWFkbWluMRQwEgYDVQQDDAtjZXJ0X2ZhYzhx
NjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMWTVJjfoWu31q1Kj3tR
NJaN6EhHdeF80uSzfxyH6BxHOi1yTj0mWzMqk7fKft2OxAdTh64bbI6UH0ce/lhm
88vHV1/iaryGrAy3awe7oGgtnGBWYV24f8CfkTETBQ0o+TeG5Fuz2zR4M2czi/mO
0XRU7wBpNf+SLqAWUzF2n0Yl5d+7GSKPB+4JV82faAscJgi3BhwifBfN2hxKRkrF
WM4V8Fr1YvEAXEw1QxbOhqgkAKF32vPQW1vbuzafafO9GBUNJupt3AEVmSBwkw+b
0IvU8HG/1Gif0GJ1r/gDbRi2EuJL6kVU/VQ864qcffuH7uUV3foOrHJExc/0sjWq
q4eDvKlXbfzMFukZtfEAVI1CdpePVkIM3uBbgc5YJ0MnFD0Nt9gQNGaKBat2CCwY
XSXVl6X5HiXu8U/WUXWnul1k2zTbvYG8xYlsJVlqR0VzJ+5dpQJ+OUl3UnvHVY4s
57xL6b4sOrZa0R3fzQpLOk+WDDK12C55Xbz7P+2Gwno6JDJ1FT2c1h/Qpp9GQWvJ
elAo/xwCg2emeCEf91Mwf9O8eEdqpG+tX1plDLsBzN6nd43J16yslOzH2UwL2SgC
vNLUZom5svjOXMnOFF5hr7pcpPQyYryGexvgvzgF84k3Wnkjlwale5M4kHtpnc/2
e+HtQARDdl/8YLvNRWTEeUZ7AgMBAAGjEDAOMAwGA1UdEwEB/wQCMAAwDQYJKoZI
hvcNAQELBQADggIBAMOiCcqeM05/DxramTWBDa8nFobvwg2viq6COdINv2u9ExN5
e+mhYMvuQi9vXZCFS8wVmHxC6i//jXc+A7lbTZiBX3ANwjw8D4tTjKVjEGw2qnmW
PRgZseqFc1YwA1/IljDyeCx9mr4DZjNE2dMnbtXRYN+etldxSLJTo4pjqp5liRiB
M8+D/MqfxF9PUAQZVjHtsW9TOcYJ90+LBbJGx4ZesxNteboCCBbUiQnavAwiu2jR
32Gq5DhojfvFW6xsvCpM24yhYUhGH3CL2V/9dhd2jNlIHtYuwE0MMC0kbjr4/yt8
t9VSLXUcsHEDs4ho9GfY0AEDf374TlQODZ8WXDUuDNvGv4sE+pkYRNhhJAI/92ve
XdjtRxnlkUNJ5Z1Dfw97A/L+aeCs4ff7ebM/poi8JSCZucRnQXy4nu67+3+yH5JK
/u9276hgSwDbXldfjz/HLbienZ2tnv78A8f3V/JGoAAd1H8K1bSG84h9K0RwoBKd
LhzEFjHX43YnfQ721c3nPYgc4QR7a0LVj3df9IDf0LKOhWPB5V/dWdLBI8txzuXN
UM9yTiBSWfiTH2aCO/IJgJWdRkijyuZsuBakoWJFyYZtL2LU0bnn3LVDL1mo/YWg
/PbtxS/kFwjvpvrbwIkoYBINd8v7ulRHOnc5GOGaeT80sfYHxFv1DBLkokyh
-----END CERTIFICATE-----
`;

const authCfg = {
  endpoint: 'https://login.landcover100.com',
  clientId: '2ad095dec6ed461cdf87',
  clientSecret: 'd5fedc8ed12f05841ec6c0257c60ccb66a58226c',
  certificate: cert,
  orgName: 'RuiduobaoOrganization',
  appName: 'LandCover100APP',
}


const sdk = new SDK(authCfg);

const app = express();
// 设置静态文件服务
app.use(express.static('public'));

// app.use(cors({
//   origin: Server_URL, // 允许来自您的前端域的请求
//   credentials: true
// }));
app.use(cors({
  origin: Server_URL,
  credentials: true
}))

//渲染的网页模板路径

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('index_login');
});


app.get('/api/getUserInfo', (req, res) => {
  // console.log("/api/getUserInfo")
  // console.log(req)
  let urlObj = url.parse(req.url, true).query;
  console.log("urlObj.token",urlObj.token)
  let user = sdk.parseJwtToken(urlObj.token);
  console.log("JSON.stringify(user)",JSON.stringify(user))
  res.write(JSON.stringify(user));
  res.end();
});

app.post('*', (req, res) => {
  let urlObj = url.parse(req.url, true).query;
  sdk.getAuthToken(urlObj.code).then(response => {
    
    const accessToken = response.access_token;
    // const accessToken = response;
    // console.log("JSON.stringify({ token: accessToken })",JSON.stringify({ token: accessToken }))
    // const refresh_token = response.refresh_token;
    res.send(JSON.stringify({ token: accessToken }));
  });
});

app.listen(port, () => {
  console.log('Server listening at ',Server_URL);
});

//跳转到用户主页信息的路由
app.get("/user", (req, res) => {
  const userinfo = JSON.parse(req.query.userinfo);
  res.render("user", {
    name: userinfo.name,
    createdTime: userinfo.createdTime,
    score:userinfo.score,
    type:userinfo.type,
    phone:userinfo.phone
  });
})

// 定义/login路由,用户修改密码后跳转到该网页
app.get('/login', (req, res) => {
    res.redirect(Server_URL); // 重定向到指定的URL
});