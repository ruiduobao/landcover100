//casdoor的登录脚本
//设置网址（本地环境和服务器环境）
const Server_URL="http://localhost:3003"
// const Server_URL='https://www.landcover100.com'
window.addEventListener('load', () => {
  if (window.location.href.indexOf('code') !== -1) {
    // let usernameElement = document.querySelector(".username");
    let signOutBtn = document.querySelector("#signOut");
    let signInBtn = document.querySelector("#signIn");
    // let usernameLabel = document.querySelector("#username");
    let info_urlLabel = document.querySelector("#info_url");

    signInBtn.className = "hidden";
    signOutBtn.className = "show";
    // usernameLabel.className = "show";
    info_urlLabel.className="show";

    signOutBtn.addEventListener("click", signOut);

    if (!sessionStorage.getItem('token')) {
      sdk.signin(Server_URL).then(res => {
        console.log(res)
        sessionStorage.setItem('token', res.token);
      });
    }
    //获取用户信息
    async function getInfo() {
      let token = sessionStorage.getItem('token');
      console.log(token)
      if (!token) { return; }
      else {
        return fetch(Server_URL+`/api/getUserInfo?token=${token}`).then(res => res.json());
      }
    }

    setTimeout(() => {
      getInfo().then(res => setInfo(res));
    }, 500);

    function setInfo(res) {
      let userinfo = res;
      sessionStorage.setItem('userinfo', JSON.stringify(userinfo));
    //   usernameElement.textContent = userinfo.name;
      info_urlLabel.textContent = userinfo.name;
    }

    function signOut() {
      sessionStorage.removeItem("token");
      window.location.href = Server_URL;
    }
  };
  //get the element
  const signInBtn = document.querySelector("#signIn");
  function gotoSignInPage() {
    window.location.href = sdk.getSigninUrl();
  }
  function gotoSignUppage() {
    window.location.href = sdk.getSignupUrl();
  }
  signInBtn.addEventListener("click", gotoSignInPage);
})
//跳转到用户主页函数
function gotoUserPage(){
  const userinfo = JSON.parse(sessionStorage.getItem('userinfo'));
  window.location.href = "/user?userinfo=" + encodeURIComponent(JSON.stringify(userinfo));
}