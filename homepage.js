const myInput = document.getElementById("myInput");
const closes = document.querySelector(".close");
const searchbutton = document.querySelector(".searchbutton");
const Domain = document.querySelector(".Domain");
const Inforpage = document.querySelector(".InforPage");
const names = document.querySelector(".name");
const pictures = document.getElementById("pictures"); // 使用id选择器
const input = document.getElementById('myInput');
const span = document.getElementById('mySpan');
const Att_fenxi_one = document.querySelector(".Att_fenxi_one");
const teacherEnter = document.querySelector(".teacherEnter");
const kuang = document.querySelector(".kuang");
const Att_fenxi_two = document.querySelector(".Att_fenxi_two");
const Att_fenxi_three = document.querySelector(".Att_fenxi_three");
const Att_fenxi_four = document.querySelector(".Att_fenxi_four");
const OpPage = document.querySelector(".OpPage");
const text_three = document.querySelector(".text_three");

// 行为代码映射分数
const BEHAVIOR_SCORE_MAP = {
  '迟到': 2,
  '有事': 1,
  '旷课': 4,
  '请假': 3,
  '讲话': 1,
  '走动': 2
};

// 添加缺失的学生
function addMissingStudents() {
  const existingNames = new Set(window.Data.map(student => student.name));
  window.Allnames.forEach(name => {
      if (!existingNames.has(name)) {
          window.Data.push({
              name: name,
              Att: [
                  { AllScores: [] },
                  { Details: [] },
                  { Ranking: 0 }
              ]
          });
      }
  });
}

// 填充缺失的日期
function fillMissingDates() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 月份从 0 开始，需要加 1
  const daysInMonth = new Date(year, month, 0).getDate();

  window.Data.forEach(student => {
      const details = student.Att[1].Details;
      const existingDays = new Set(details.map(detail => detail.Day));

      for (let day = 1; day <= daysInMonth; day++) {
          const dayStr = `${month}.${day.toString().padStart(2, '0')}`;
          const dayStrNoLeadingZero = `${month.toString().replace(/^0+/, '')}.${day.toString().padStart(2, '0')}`;
          if (!existingDays.has(dayStrNoLeadingZero)) {
              details.push({ Day: dayStrNoLeadingZero, Content: [] });
          }
      }

      // 按照 Day 排序 Details
      details.sort((a, b) => {
          const [aMonth, aDay] = a.Day.split('.').map(Number);
          const [bMonth, bDay] = b.Day.split('.').map(Number);
          if (aMonth === bMonth) {
              return aDay - bDay;
          }
          return aMonth - bMonth;
      });
  });
}

// 计算分数并填充到 AllScores
function calculateScores() {
  window.Data.forEach(student => {
      const allScores = student.Att[0].AllScores;
      const details = student.Att[1].Details;

      details.forEach(detail => {
          const content = detail.Content;
          const score = content.reduce((acc, behavior) => acc + (BEHAVIOR_SCORE_MAP[behavior] || 0), 0);

          // 直接将分数添加到 AllScores 中
          allScores.push({ value: score, Day: detail.Day });
      });

      // 按照 Day 排序 AllScores
      allScores.sort((a, b) => {
          const [aMonth, aDay] = a.Day.split('.').map(Number);
          const [bMonth, bDay] = b.Day.split('.').map(Number);
          if (aMonth === bMonth) {
              return aDay - bDay;
          }
          return aMonth - bMonth;
      });
  });
}

// 调用函数添加缺失的学生
addMissingStudents();
// 调用函数填充缺失的日期
fillMissingDates();
// 调用函数计算分数
calculateScores();
console.log(JSON.stringify(window.Data, null, 0).replace(/[\n\r]/g, ''));

// 生成 label 标签
function generateLabels(count) {
  const labels = [];
  for (let i = 0; i < count; i++) {
    labels.push((3 + i*0.01).toFixed(2));
  }
  return labels;
}

// 更新 window.Data 中的 label
window.Data.forEach(item => {
  const allScores = item.Att[0].AllScores;
  const labels = generateLabels(allScores.length);
  allScores.forEach((score, index) => {
    score.label = labels[index];
  });
  // 计算总分
  const totalScore = allScores.reduce((sum, score) => sum + score.value, 0);
  item.Att.totalScore = totalScore;
});

// 根据总值对所有学生进行排序
window.Data.sort((a, b) => b.totalScore - a.totalScore);

// 更新每个学生的 Rank 字段
window.Data.forEach((item, index) => {
  item.Att[2].Ranking = index + 1;
});

console.log(window.Data);

// 防抖函数（带立即执行选项）
function debounce(func, delay, immediate) {
    let timer;
    return function(...args) {
      const context = this;
      if (immediate) {
        if (!timer) func.apply(context, args);
        timer = true;
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
      }
    };
}

// 状态更新
function updateSpan() {
    const hasContent = input.value.trim() !== '';
    const isFocused = document.activeElement === input;
    if (hasContent) {
      span.classList.remove('span');
      span.classList.add('focused-style');
    } else {
      span.classList.add('span');
      span.textContent = "请输入名字";
      span.classList.remove('focused-style');
    }
}

// 事件绑定
input.addEventListener('input', debounce(updateSpan, 300));    // 输入时防抖
input.addEventListener('focus', updateSpan);                  // 聚焦时立即触发
input.addEventListener('blur', updateSpan);                   // 失焦时立即触发

// 初始化调用（处理页面加载时的初始状态）
window.addEventListener('DOMContentLoaded', updateSpan);