//casdoor的登录脚本
//设置网址（本地环境和服务器环境）
const Server_URL="http://localhost:3003"
//用户token信息
let token
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

    if (!localStorage.getItem('token')) {
      sdk.signin(Server_URL).then(res => {
        console.log(res)
        localStorage.setItem('token', res.token);
      });
    }
    //获取用户信息
    async function getInfo() {
      token = localStorage.getItem('token');
      console.log(token)
      if (!token) { return; }
      else {
        return fetch(Server_URL+`/api/getUserInfo?token=${token}`).then(res => res.json());
      }
    }

    setTimeout(() => {
      getInfo().then(res => setInfo(res));
    }, 500);
    //个人信息
    function setInfo(res) {
      let userinfo = res;
      localStorage.setItem('userinfo', JSON.stringify(userinfo));
      //usernameElement.textContent = userinfo.name;
      info_urlLabel.textContent = userinfo.name;
    }
    //注销函数
    function signOut() {
      localStorage.removeItem("token");
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
  const userinfo = JSON.parse(localStorage.getItem('userinfo'));
  window.location.href = "/user?userinfo=" + encodeURIComponent(JSON.stringify(userinfo));
}

// 跳转到使用须知网页中 gotoUserPage
function gotoUserWebPage(){
  window.location.href = "/UserWebPage" ;
}