//省份和对应代码
const provinceCodes = {
    '北京市': '110000',
    '天津市': '120000',
    '河北省': '130000',
    '山西省': '140000',
    '内蒙古自治区': '150000',
    '辽宁省': '210000',
    '吉林省': '220000',
    '黑龙江省': '230000',
    '上海市': '310000',
    '江苏省': '320000',
    '浙江省': '330000',
    '安徽省': '340000',
    '福建省': '350000',
    '江西省': '360000',
    '山东省': '370000',
    '河南省': '410000',
    '湖北省': '420000',
    '湖南省': '430000',
    '广东省': '440000',
    '广西壮族自治区': '450000',
    '海南省': '460000',
    '重庆市': '500000',
    '四川省': '510000',
    '贵州省': '520000',
    '云南省': '530000',
    '西藏自治区': '540000',
    '陕西省': '610000',
    '甘肃省': '620000',
    '青海省': '630000',
    '宁夏回族自治区': '640000',
    '新疆维吾尔自治区': '650000',
    '香港特别行政区': '810000',
    '澳门特别行政区': '820000',
    '台湾省': '710000'
    };


//按选中区域选择功能进行显示
function handleSelectChange() {
    var selectedValue = document.getElementById('data_type_select').value;
    var administrativeContainer = document.getElementById('administrative-select-container');
    var fileUploadContainer = document.getElementById('file-upload-container');
    var drawIconsContainer = document.getElementById('drawIcons');

    // 隐藏所有其他选项
    administrativeContainer.style.display = 'block';
    fileUploadContainer.style.display = 'none';
    drawIconsContainer.style.display = 'none';

    switch(selectedValue) {
        case 'type1': // 当选中按行政区划时
            fileUploadContainer.style.display = 'none';
            drawIconsContainer.style.display = 'none';
            break;
        case 'type2': // 当选中本地上传时
            fileUploadContainer.style.display = 'block';
            administrativeContainer.style.display = 'none';
            drawIconsContainer.style.display = 'none';
            break;
        case 'type3': // 当选中在线勾画时
            drawIconsContainer.style.display = 'block';
            fileUploadContainer.style.display = 'none';
            administrativeContainer.style.display = 'none';
            break;
    }
}

// 页面加载完成后绑定change事件到select框
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('data_type_select').addEventListener('change', handleSelectChange);
    fillProvinceSelect();
    // 设置默认选项为type1，并触发change事件以显示省级选择框
    document.getElementById('data_type_select').value = 'type1';
    handleSelectChange();

    // 为市级选择框添加事件监听器
    const citySelect = document.getElementById('city_select');
    citySelect.addEventListener('change', function() {
        var city_code = this.value;
        console.log('选中的市级代码是:', city_code);
        // 在这里读取和解析对应市级编码的.md文件，然后更新县级选择框
        fetch(`/shengshixian/xianxiangcun/${city_code}.md`)
            .then(response => response.text())
            .then(text => {
                updateCountySelect(text);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});

// 填充省级select的函数
function fillProvinceSelect() {
    console.log('选择省份'); 
    var provinceSelect = document.getElementById('province_select');
    for (var province in provinceCodes) {
        var option = document.createElement('option');
        option.value = provinceCodes[province];
        option.text = province;
        provinceSelect.appendChild(option);
    }

    // 添加change事件监听器到province_select，并将查询到的矢量加载到地图中
    provinceSelect.addEventListener('change', function() {
        var sheng_code = this.value;
        console.log('选中的省级代码是:', sheng_code);

        // 在这里读取和解析shengshi.md文件，然后更新城市选择框
        fetch('/shengshixian/shengshi.md')
            .then(response => response.text())
            .then(text => {
                updateCitySelect(text, sheng_code);
            })
            .catch(error => {
                console.error('Error:', error);
            });

        console.log('选中的省级代码是:', sheng_code); // 或者你可以在这里做其他事情

        // 调用POST路由来获取矢量数据
        fetch('/getGsonDB', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: sheng_code }) // 发送省份代码
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 使用从POST路由获得的路径加载矢量
                loadGeoJSONfromPath(data.filepath);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

// 用于更新城市选择框的函数
function updateCitySelect(mdContent, provinceCode) {
    const citySelect = document.getElementById('city_select');
    // 移除旧的事件监听器以防止重复添加
    citySelect.removeEventListener('change', citySelectChangeHandler);
    citySelect.innerHTML = ''; // 清空现有的城市列表
    
    // 解析Markdown内容
    const lines = mdContent.split('\n');
    let provinceFound = false;
    for (const line of lines) {
        // 检查是否为所需的省份
        if (line.startsWith('# ') && line.includes(provinceCode)) {
            provinceFound = true;
            continue; // 省份已找到，跳过添加，接下来添加城市
        }
        
        // 如果省份已找到，开始查找城市
        if (provinceFound && line.startsWith('## ')) {
            const cityInfo = line.match(/## (.*) (\d+)/);
            if (cityInfo) {
                const cityName = cityInfo[1];
                const cityCode = cityInfo[2];
                const option = document.createElement('option');
                option.value = cityCode;
                option.text = cityName;
                citySelect.appendChild(option);
            }
        }

        // 如果下一个省份开始，则停止添加城市
        if (provinceFound && line.startsWith('# ') && !line.includes(provinceCode)) {
            break;
        }
    }
    //添加选中的市级单位到地图上
    // 添加新的事件监听器
    citySelect.addEventListener('change', citySelectChangeHandler);
}

// 市级选择框变化时的处理函数
function citySelectChangeHandler() {
    var city_code = this.value;
    console.log('选中的市级代码是:', city_code); // 打印到控制台
    // 如果你需要将选中的城市代码显示在页面上，你可以在这里实现
    // 调用POST路由来获取矢量数据
    fetch('/getGsonDB', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: city_code}) // 发送省份代码
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // 使用从POST路由获得的路径加载矢量
            loadGeoJSONfromPath(data.filepath);
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// 更新县级选择框的函数
function updateCountySelect(mdContent) {
    const countySelect = document.getElementById('county_select');
    countySelect.innerHTML = ''; // 清空现有的县级列表

    // 使用正则表达式来匹配Markdown中的一级标题，也就是县级单位
    const countyRegex = /^# (.+?) (\d+)/gm;
    let match;

    // 使用正则表达式循环匹配文件内容中的所有县级单位
    while ((match = countyRegex.exec(mdContent)) !== null) {
        const countyName = match[1].trim();
        const countyCode = match[2].trim();

        // 创建新的option元素，并设置它的值和文本
        const option = document.createElement('option');
        option.value = countyCode;
        option.textContent = countyName;

        // 将新的option元素添加到县级选择框中
        countySelect.appendChild(option);
    }
    countySelect.addEventListener('change', countySelectChangeHandler);
}

// 县级选择框变化时的处理函数
function countySelectChangeHandler() {
    var county_code = this.value;
    var county_name = this.options[this.selectedIndex].text
    console.log('选中的县级代码是:', county_code);
    // 调用POST路由来获取县级矢量数据
    fetch('/getGsonDB', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: county_code}) // 发送省份代码
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // 使用从POST路由获得的路径加载矢量
            loadGeoJSONfromPath(data.filepath);
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // 更新乡级选择框
    var CITY_NAME=county_code.substring(0, 4) + "00"
    fetch(`/shengshixian/xianxiangcun/${CITY_NAME}.md`)
        .then(response => response.text())
        .then(text => {
            console.log('更新乡镇成功打开市级文件CITY_NAME', CITY_NAME);
            console.log('更新乡镇成功打开市级文件county_name', county_name);
            // 使用正则表达式的非贪婪模式定位到选中的县级标题及其之后的内容，直到下一个一级标题或文档结尾
            const countySectionRegex = new RegExp(`# ${county_name}\\s+.*?(?:\\n# |$)`, 'gm');
            let countySectionMatch = countySectionRegex.exec(text);
            console.log('匹配的乡级数据为：', countySectionMatch);
            updateXiangSelect(text,county_name);
        })
        .catch(error => {
            console.error('Error:', error);
            console.log('乡镇打开市级文件失败', county_code);
    });
}

// 更新乡级选择框，仅解析选中的县级标题下的二级标题
function updateXiangSelect(mdContent, countyName) {
    const xiangSelect = document.getElementById('xiang_select');
    xiangSelect.innerHTML = ''; // 清空现有的乡级列表

    // 使用正则表达式的非贪婪模式定位到选中的县级标题及其之后的内容，直到下一个一级标题或文档结尾
    const countySectionRegex = new RegExp(`# ${countyName}\\s+.*?(?:\\n# |$)`, 'gm');
    let countySectionMatch = countySectionRegex.exec(mdContent);
    if (!countySectionMatch) return; // 如果没有找到对应的县，就直接返回
    console.log('匹配的乡级数据为：', countySectionMatch);
    // 取得选中县级之后的全部内容
    let countySection = countySectionMatch[0];

    // 此处我们限定了只在此县级范围内匹配乡级标题
    const xiangRegex = /^## (.+?)\s/gm;
    let match;
    while ((match = xiangRegex.exec(countySection)) !== null) {
        const xiangName = match[1].trim();
        // ...添加option到xiangSelect
        const option = document.createElement('option');
        option.value = xiangName;
        option.textContent = xiangName;
        xiangSelect.appendChild(option);
    }
    // 添加乡级监视器
    xiangSelect.addEventListener('change', xiangSelectChangeHandler);

    
}

// 乡级选择框变化时的处理函数
function xiangSelectChangeHandler() {
    var xiang_code = this.value;
    console.log('选中的乡级代码是:', xiang_code);
    // 更新村级选择框
    updateCunSelect(xiang_code);
}

// 用于更新村级选择框的函数，假设村级信息在三级标题下
function updateCunSelect(mdContent, xiangName) {
    const cunSelect = document.getElementById('cun_select');
    cunSelect.innerHTML = ''; // 清空现有的村级列表
    // 为了匹配乡下面的村，首先要定位到当前乡的位置
    const lines = mdContent.split('\n');
    let xiangFound = false;
    for (const line of lines) {
        // 检查是否为当前选中的乡
        if (line.startsWith('## ') && line.includes(xiangName)) {
            xiangFound = true;
            continue;
        }
        // 如果乡已找到，开始查找下面的村
        if (xiangFound && line.startsWith('### ')) {
            const cunName = line.substring(4).trim(); // 去掉"### "部分
            const option = document.createElement('option');
            option.value = cunName;
            option.text = cunName;
            cunSelect.appendChild(option);
        }
        // 如果到达下一个乡的标题，停止查找村
        if (xiangFound && line.startsWith('## ') && !line.includes(xiangName)) {
            break;
        }
    }
}
