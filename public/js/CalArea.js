async function CalArea(vectorDataFilePath) {
    return fetch('/calculate_area', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vectorDataFilePath: vectorDataFilePath })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Area:', data.area);  // 可以选择保留或删除这个日志
        return data.area;
    })
    .catch(error => {
        console.error('Error:', error);
        throw error;  // 将错误向上抛出
    });
}
