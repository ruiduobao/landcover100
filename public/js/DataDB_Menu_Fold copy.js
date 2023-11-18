// 定义全局变量 用于获取选中的数据源
let selected_DataDB_NAME;

// 二级和三级菜单控制代码
document.addEventListener('DOMContentLoaded', function () {
    var toggles = document.querySelectorAll('.menu-toggle');
    // 设置单选按钮的监听器  用于获取选中的数据源名称
    setupRadioButtons();
    toggles.forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
        e.preventDefault(); // 阻止默认的链接行为
        var submenu = this.nextElementSibling;

        if (submenu && submenu.classList.contains('submenu')) {
            // 检查这个子菜单是否已经打开
            if (submenu.style.display === "block") {
            submenu.style.display = "none";
            this.classList.remove('active');
            } else {
            // 关闭同一级别的其他子菜单
            let siblingSubmenus = this.parentElement.parentElement.querySelectorAll('.submenu');
            siblingSubmenus.forEach(function (menu) {
                if(menu !== submenu) {
                menu.style.display = 'none';
                }
            });

            // 打开当前子菜单
            submenu.style.display = "block";
            // 移除其他所有active状态
            siblingSubmenus.forEach(function (menu) {
                if(menu.previousElementSibling) {
                menu.previousElementSibling.classList.remove('active');
                }
            });
            // 给当前toggle添加active状态
            this.classList.add('active');
            }
        }
        });
    });
    });


// 设置单选按钮的监听器函数 
function setupRadioButtons() {
    var menuChoices = document.querySelectorAll('input[type="radio"][name="menu_choice"]');
    menuChoices.forEach(function(choice) {
        choice.addEventListener('change', function() {
            // 当单选按钮被选中时，更新全局变量
            if (this.checked) {
                selected_DataDB_NAME = this.id;
                console.log("Selected raster_DB ID: " + selected_DataDB_NAME); // 在控制台输出所选ID
            }
        });
    });
}