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

import Sdk from 'casdoor-js-sdk';

const sdkConfig = (window as any).SNConfig.casdoorSdkSetting;

export const CasdoorSDK = new Sdk(sdkConfig);

export const isLoggedIn = () => {
  const token = getToken();
  return token !== null && token.length > 0;
};

export const setToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

export const getToken = () => {
  return localStorage.getItem('accessToken') || '';
};

export const goToLink = (link: string) => {
  window.location.href = link;
};

export const getUserinfo = () => {
  return CasdoorSDK.getUserInfo(getToken());
};

export const goToProfilePage = () => {
  window.location.assign(CasdoorSDK.getMyProfileUrl({} as any));
};

export const logout = () => {
  localStorage.removeItem('accessToken');
};
