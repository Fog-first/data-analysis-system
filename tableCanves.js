// 初始化部分
function initializeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const namesElement = document.querySelector('.name');
    if (!namesElement) {
        console.error('Element with class .name not found');
        return null;
    }
    const nameValue = namesElement.textContent;
    const dataItem = Data.find(item => item.name === nameValue);
    if (!dataItem) {
        console.error(`Data for name ${nameValue} not found`);
        return null;
    }
    return { canvas, ctx, dataItem };
}

// 辅助函数
function createGradient(ctx, height, width) {
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, 'rgb(43, 150, 119)');
    gradient.addColorStop(1, 'rgb(70, 189, 156)');
    return gradient;
}

function calculateGap(canvasWidth, dataLength, barWidth) {
    return (canvasWidth - 100 - (dataLength * barWidth)) / (dataLength + 1); // 动态计算间隙
}

function drawBarValue(ctx, value, x, y, barWidth) {
    ctx.fillStyle = '#263339';
    ctx.font = '16px 楷体';
    ctx.textAlign = 'center';
    ctx.fillText(value, x + barWidth / 2, y - 5);
}

function drawXAxisLabels(ctx, attData, barWidth, gap) {
    ctx.fillStyle = '#263339';
    ctx.font = '14px 楷体';
    ctx.textAlign = 'center';
    attData.forEach((item, index) => {
        const x = 50 + gap + (barWidth + gap) * index + barWidth / 2;
        const y = ctx.canvas.height - 35;
        ctx.fillText(item.label, x, y);
    });
}

function drawAxes(ctx, canvasHeight, barWidth, gap) {
    ctx.lineWidth = 1; // 设置线宽
    ctx.strokeStyle = '#263339'; // 将坐标轴颜色改为灰色
    // X轴
    ctx.beginPath();
    ctx.moveTo(50, canvasHeight - 50);
    ctx.lineTo(ctx.canvas.width - 50, canvasHeight - 50);
    ctx.stroke();
}

// 柱状图绘制
function drawBarChart(canvasId) {
    const { canvas, ctx, dataItem } = initializeCanvas(canvasId);
    if (!canvas || !ctx || !dataItem) return;
    const attData = dataItem.Att[0].AllScores;

    // 设置背景颜色为浅白色
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 计算比例尺
    const maxData = Math.max(...attData.map(d => d.value));
    const scaleY = (canvas.height - 100) / maxData; // 留出空间给轴和标签

    // 创建渐变颜色
    const gradient = createGradient(ctx, canvas.height, canvas.width);

    // 动画参数
    const animationDuration = 2000; // 动画持续时间（毫秒）
    const startTime = performance.now();

    // 开始动画
    requestAnimationFrame(drawBars);

    // 绘图部分
    function drawBars(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 创建单侧方向线性直线纹理
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = 10;
        patternCanvas.height = 10;
        patternCtx.strokeStyle = 'rgba(144, 238, 144, 0.5)'; // 浅绿色
        patternCtx.lineWidth = 2;
        patternCtx.beginPath();
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(10, 10);
        patternCtx.stroke();
        const pattern = ctx.createPattern(patternCanvas, 'repeat');

        // 绘制柱子
        const barWidth = 20;
        const gap = calculateGap(canvas.width, attData.length, barWidth);
        attData.forEach((item, index) => {
            const x = 50 + gap + (barWidth + gap) * index;
            const y = canvas.height - 50 - Math.round(item.value * scaleY * progress);
            
            // 先用深绿色填充柱子
            ctx.fillStyle = 'rgb(43, 150, 119)';
            ctx.fillRect(x, y, barWidth, canvas.height - 50 - y); // 确保柱子底部与X轴对齐
            
            // 再用斜线纹理叠加
            ctx.fillStyle = pattern;
            ctx.fillRect(x, y, barWidth, canvas.height - 50 - y); // 确保柱子底部与X轴对齐

            // 绘制柱子上的数值
            if (progress >= 1) {
                drawBarValue(ctx, item.value, x, y, barWidth);
            }
        });

        if (progress < 1) {
            requestAnimationFrame(drawBars);
        } else {
            // 动画结束后绘制X轴标签和Y轴刻度
            drawXAxisLabels(ctx, attData, barWidth, gap);
            drawAxes(ctx, canvas.height, barWidth, gap);
        }
    }
}

// 表格绘制
function drawTableChart(canvasId) {
    const { canvas, ctx, dataItem } = initializeCanvas(canvasId);
    if (!canvas || !ctx || !dataItem) return;
    const details = dataItem.Att[1].Details;

    // 获取Canvas的宽和高
    const canvasWidth = canvas.width;

    // 计算单元格宽度和高度
    const cellWidth1 = canvasWidth * 0.2; // 第一列占1/5
    const cellWidth2 = canvasWidth * 0.6; // 第二列占3/5
    const cellWidth3 = canvasWidth * 0.2; // 第三列占1/5
    const cellHeight = 40;

    // 初始化表格数据
    const tableData = [
        ['日期', '内容', '结算']
    ];

    // 计算结算列的分数
    details.forEach(detail => {
        let score = 0;
        detail.Content.forEach(item => {
            switch (item) {
                case '迟到':
                    score += 2;
                    break;
                case '有事':
                    score += 1;
                    break;
                case '旷课':
                    score += 4;
                    break;
                case '请假':
                    score += 3;
                    break;
                case '讲话':
                    score += 1;
                    break;
                case '走动':
                    score += 2;
                    break;
                default:
                    break;
            }
        });
        tableData.push([detail.Day, detail.Content.join(', '), score]);
    });

    // 计算Canvas高度
    const numRows = tableData.length;
    const canvasHeight = numRows * cellHeight;
    canvas.height = canvasHeight;

    // 定义颜色
    const darkColor = '#80CBC4'; // 深青色
    const darkerColor = '#43A49B'; // 更深的青色
    const lightColor = '#D0EBEA'; // 浅青色
    const whiteColor = 'rgb(255, 255, 255)'; // 白色

    // 动画参数
    const animationDuration = 3000; // 动画持续时间（毫秒）
    const startTime = performance.now();

    // 开始动画
    requestAnimationFrame(drawTable);

    // 绘图部分
    function drawTable(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 清除画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制表格
        tableData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let x, cellWidth;
                if (colIndex === 0) {
                    x = 0;
                    cellWidth = cellWidth1;
                } else if (colIndex === 1) {
                    x = cellWidth1;
                    cellWidth = cellWidth2;
                } else {
                    x = cellWidth1 + cellWidth2;
                    cellWidth = cellWidth3;
                }
                const y = rowIndex * cellHeight * progress;
                let backgroundColor;

                if (colIndex === 0) { // 第一列
                    backgroundColor = rowIndex % 2 === 0 ? darkColor : darkerColor;
                } else { // 第二列和第三列
                    backgroundColor = rowIndex % 2 === 0 ? lightColor : whiteColor;
                }

                // 绘制单元格背景
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(x, y, cellWidth, cellHeight);

                // 绘制单元格文本
                ctx.fillStyle = '#263339';
                ctx.font = '16px 楷体';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell, x + cellWidth / 2, y + cellHeight / 2);
            });
        });

        // 绘制表格边框
        ctx.strokeStyle = '#263339';
        ctx.lineWidth = 1;
        tableData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                let x, cellWidth;
                if (colIndex === 0) {
                    x = 0;
                    cellWidth = cellWidth1;
                } else if (colIndex === 1) {
                    x = cellWidth1;
                    cellWidth = cellWidth2;
                } else {
                    x = cellWidth1 + cellWidth2;
                    cellWidth = cellWidth3;
                }
                const y = rowIndex * cellHeight * progress;
                ctx.strokeRect(x, y, cellWidth, cellHeight);
            });
        });

        if (progress < 1) {
            requestAnimationFrame(drawTable);
        }
    }
}

// 六维图绘制
function drawRadarChart(canvasId) {
    const { canvas, ctx, dataItem } = initializeCanvas(canvasId);
    if (!canvas || !ctx || !dataItem) return;
    const details = dataItem.Att[1].Details;
    const count = 6;
    const power = [];
    const animationDuration = 3000; // 动画持续时间（毫秒）
    const startTime = performance.now();

    // 统计维度分数
    const scores = {
        迟到: 0,
        有事: 0,
        旷课: 0,
        请假: 0,
        讲话: 0,
        走动: 0
    };

    details.forEach(detail => {
        detail.Content.forEach(item => {
            switch (item) {
                case '迟到':
                    scores['迟到'] += 2;
                    break;
                case '有事':
                    scores['有事'] += 1;
                    break;
                case '旷课':
                    scores['旷课'] += 4;
                    break;
                case '请假':
                    scores['请假'] += 3;
                    break;
                case '讲话':
                    scores['讲话'] += 1;
                    break;
                case '走动':
                    scores['走动'] += 2;
                    break;
                default:
                    break;
            }
        });
    });

    // 计算每个顶点的半径
    const maxScore = Math.max(...Object.values(scores));
    const radiusScale = 150 / maxScore; // 半径缩放比例
    for (let i = 0; i < count; i++) {
        const key = Object.keys(scores)[i];
        power.push(scores[key] * radiusScale);
    }

    function init() {
        // 绘制背景网格
        for (let j = 0; j <= count - 1; j++) {
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                ctx.strokeStyle = 'green';
                const r = j * 40;
                const deg = (i / count * 360 + 30) * Math.PI / 180;
                const x = r * Math.sin(deg) + r * Math.cos(deg) + 400;
                const y = r * Math.sin(deg) - r * Math.cos(deg) + 400;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // 绘制穿插线
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(34, 129, 66, 0.79)'; // 设置穿插线颜色
            ctx.lineWidth = 2;
            const deg = (i / count * 360 + 30) * Math.PI / 180;
            const x1 = 400;
            const y1 = 400;
            const x2 = 200 * Math.sin(deg) + 200 * Math.cos(deg) + 400;
            const y2 = 200 * Math.sin(deg) - 200 * Math.cos(deg) + 400;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    function draw(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 重新绘制背景网格和穿插线
        init();

        // 绘制动态六维图
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(34, 129, 66, 0.79)';
        for (let i = 0; i < count; i++) {
            const r = power[i] * progress; // 根据进度调整半径
            const deg = (i / count * 360 + 30) * Math.PI / 180;
            const x = r * Math.sin(deg) + r * Math.cos(deg) + 400;
            const y = r * Math.sin(deg) - r * Math.cos(deg) + 400;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(62, 226, 117, 0.6)';
        ctx.fill();

        // 绘制顶点和分数
        for (let i = 0; i < count; i++) {
            const r = power[i] * progress; // 根据进度调整半径
            const deg = (i / count * 360 + 30) * Math.PI / 180;
            const x = r * Math.sin(deg) + r * Math.cos(deg) + 400;
            const y = r * Math.sin(deg) - r * Math.cos(deg) + 400;

            // 绘制顶点
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(30, 94, 51, 0.6)';
            ctx.fill();

            // 绘制分数
            ctx.fillStyle = 'rgb(163, 203, 240)';
            ctx.font = '600 18px 楷体';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const key = Object.keys(scores)[i];
            const score = scores[key];
            ctx.fillText(`${key}: ${score}`, x, y - 15);
        }

        if (progress < 1) {
            requestAnimationFrame(draw);
        }
    }

    // 开始动画
    requestAnimationFrame(draw);
}

// 事件监听
kuang.addEventListener('click', function () {
    drawBarChart('AttenDanceCanvas_chart');
    drawTableChart('AttenDanceCanvas_table');
    drawRadarChart('AttenDanceCanvas_Dim');
});