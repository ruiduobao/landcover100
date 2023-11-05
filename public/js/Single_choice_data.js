//单选数据的控制
document.addEventListener('DOMContentLoaded', (event) => {
    const radios = document.querySelectorAll('.menu input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            // 当一个新的单选按钮被选中时，取消其他所有单选按钮的选中状态
            radios.forEach(radio => {
                if (radio !== event.target) {
                    radio.checked = false;
                    }
                });
            });
        });
    });