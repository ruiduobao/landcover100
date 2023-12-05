// casdoor的登录脚本(登录和已登录，本地有cookie的直接显示个人信息)
// 设置网址（本地环境和服务器环境）

// 用户token信息
let token;

window.addEventListener('load', () => {
  let signOutBtn = document.querySelector("#signOut");
  let signInBtn = document.querySelector("#signIn");
  let info_urlLabel = document.querySelector("#info_url");

  token = localStorage.getItem('token'); // 获取存储在 Local Storage 中的 token。

  if (token || window.location.href.indexOf('code') !== -1) {
    // 如果 Local Storage 中有 token 或者 URL 中有 'code' 参数，那么显示已登录状态。
    signInBtn.className = "hidden";
    signOutBtn.className = "show";
    info_urlLabel.className="show";

    signOutBtn.addEventListener("click", signOut);

    if (!token) {
      // 如果 Local Storage 中没有 token，尝试登录并获取 token。
      sdk.signin(Server_URL).then(res => {
        console.log(res);
        localStorage.setItem('token', res.token);
        token = res.token;
      });
    }

    // 获取用户信息
    async function getInfo() {
      if (!token) { return; }
      else {
        return fetch(Server_URL+`/api/getUserInfo?token=${token}`).then(res => res.json());
      }
    }

    setTimeout(() => {
      getInfo().then(res => setInfo(res));
    }, 500);

    // 设置用户信息
    function setInfo(res) {
      let userinfo = res;
      localStorage.setItem('userinfo', JSON.stringify(userinfo));
      info_urlLabel.textContent = userinfo.name;
    }

    // 注销函数
    function signOut() {
      localStorage.removeItem("token");
      window.location.href = Server_URL;
    }
  }

  // 登录按钮点击事件
  function gotoSignInPage() {
    window.location.href = sdk.getSigninUrl();
  }

  signInBtn.addEventListener("click", gotoSignInPage);
});

// 跳转到用户主页函数
function gotoUserPage(){
  const userinfo = JSON.parse(localStorage.getItem('userinfo'));
  window.location.href = "/user?userinfo=" + encodeURIComponent(JSON.stringify(userinfo));
}

// 跳转到使用须知网页中 gotoUserPage
function gotoUserWebPage(){
  window.location.href = "/UserWebPage";
}