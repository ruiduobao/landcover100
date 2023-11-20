// 定义全局变量 用于获取选中的数据源
let selected_DataDB_NAME;

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

//新的扩展
document.addEventListener('DOMContentLoaded', function () {
    // 设置单选按钮的监听器  用于获取选中的数据源名称
    setupRadioButtons();
    const toggles = document.getElementsByClassName('toggle');
    for (const toggle of toggles) {
      toggle.addEventListener('click', function () {
        const ulElement = this.parentElement.querySelector('ul');
        if (ulElement) {
            ulElement.classList.toggle('hidden');
        }
      });
    }
  });
  //预览：读取csv文件对应id的wmts
// 替代Papa Parse的CSV解析函数
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');

  const result = [];
  for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentLine = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentLine[j];
      }

      result.push(obj);
  }

  return result;
}

// 替代Papa Parse的fetch函数
function fetchCSV(filePath) {
  return new Promise((resolve, reject) => {
      fetch(filePath)
          .then(response => response.text())
          .then(data => resolve(data))
          .catch(error => reject(error));
  });
}

// 替代Papa Parse的CSV解析调用 查找wmts链接
function findWmtsByIdAndExecute(id) {
  return new Promise((resolve, reject) => {
      const filePath = '/WMTS_excel/rasterDB_excel.csv';
      fetchCSV(filePath)
          .then(data => {
              const csvData = parseCSV(data);
              const entry = csvData.find(row => row.id === id);
              if (entry) {
                  resolve(entry.wmts);
              } else {
                  reject('No matching ID found');
              }
          })
          .catch(error => reject('Error loading CSV: ' + error));
  });
}

//预览的选中状态以及展示预览图层
function toggleImageBorder(img,id) {
    // 移除所有其他图片的选中状态
    var currentlySelected = document.querySelector('.selected-img');
    if (currentlySelected) {
      currentlySelected.classList.remove('selected-img');
    }
    // 如果点击的不是当前已选中的图片，给它添加选中效果
    if (currentlySelected !== img) {
      img.classList.toggle('selected-img');
    }
    // GETSEEMAP2MAP()
    const workspace="landcover100_resample_china"
    const coverageName=id//数据的id
    // 检查当前图层是否已被选中
    if (currentWmtsLayerId === id) {
      // 如果当前图层已被选中，则移除该图层并重置当前图层ID
      map.remove([currentWmtsLayer]);
      currentWmtsLayerId = null;
  } else {
      // 否则，加载新的图层并更新当前图层ID
      img.classList.add('selected-img');
      findWmtsByIdAndExecute(id)
          .then(wmtsLink => {
              addWmtsLayerToMap(map, wmtsLink);
              currentWmtsLayerId = id;
          })
          .catch(error => console.log(error));
  }
}

