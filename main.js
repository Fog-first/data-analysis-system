let MatchContent = { AttenDance: "InAttenDance", Performance: "InPerformance", Achievement: "InAchievement" };

function close(className) {
    className.style.display = "none";
}
function Open(className) {
    className.style.display = "block";
}
closes.addEventListener("click", () => {
    close(Inforpage);
    for (let key in MatchContent) {
        let getElementClass = document.querySelector(`.${key}`);
        let targetElement = document.querySelector(`.${MatchContent[key]}`);
        getElementClass.classList.remove("ChooseEnd");
        targetElement.style.display = "none";
    }
});
searchbutton.addEventListener("click", () => {
    let seacher = myInput.value;
    window.Data.forEach(element => {
        if (element.name == seacher) {
            names.textContent = element.name;
            Inforpage.style.display = "flex";
            FenxiScores(element.name);
        } else {
            span.textContent = "没有找到该学生";
        }
    });
});

//Att数据分析
function FenxiScores(AttScores) {
    let New_AttScore = window.Data.find(element => element.name == AttScores);
    let New_AttScores = New_AttScore.Att[0].AllScores;
    let maxScores = New_AttScores[0].value;
    let maxScoresName = New_AttScores[0].label;
    let myscores = 0;
    for (let i = 0; i < New_AttScores.length; i++) {
        if (maxScores < New_AttScores[i].value) {
            maxScores = New_AttScores[i].value;
            maxScoresName = New_AttScores[i].label;
        } else {
            console.log("than small");
        }
        myscores += New_AttScores[i].value;
    }
    console.log(maxScoresName, maxScores.length);
    
    // 解析日期格式 3.23 或 3.1
    const dateParts = maxScoresName.split('.');
    const month = dateParts[0];
    const day = dateParts[1];
    
    Att_fenxi_one.textContent = "缺勤高峰日：" + month + "月" + day + "日 [" + maxScores + "]";
    Att_fenxi_two.textContent = "缺勤总分：" + myscores;
    Att_fenxi_four.textContent = "总分在班级中的排名:" + New_AttScore.Att[2].Ranking + "名 (超越：" + (((New_AttScore.Att[2].Ranking - 1) / window.Data.length) * 100).toFixed(2) + "%同学)";
    Att_fenxi_three.textContent = "周平均分(自己):" + (New_AttScore.Att.totalScore / New_AttScores.length).toFixed(2) + "分";
    console.log(maxScores, myscores);
}

//text_three展开
text_three.addEventListener("click", () => {
    if (text_three.classList.contains("text_threeAdd")) {
        text_three.classList.remove("text_threeAdd");
    } else {
        text_three.classList.add("text_threeAdd");
    }
})

//数据面板切换
Domain.addEventListener("click", (event) => {
    let target = event.target;
    let getElement = target.classList.value.replace(" kuang", "");
    for (let key in MatchContent) {
        let getElementClass = document.querySelector(`.${key}`);
        getElementClass.classList.remove("ChooseEnd");
        let targetElement = document.querySelector(`.${MatchContent[key]}`);
        if (getElement === key) {
            console.log("页面选择，绿色按钮,检测成功");
            targetElement.style.display = "block";
            getElementClass.classList.add("ChooseEnd");
        } else {
            console.log("页面选择，绿色按钮,检测失败");
            targetElement.style.display = "none";
        }
    }
});