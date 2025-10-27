//博客文章页面的交互功能增强脚本，主要用于优化文章阅读体验，涵盖图片查看、分享按钮布局、
//打赏功能、目录（TOC）导航、代码块美化等多个核心交互场景。

//图片查看功能初始化
import { initImageViewer } from "./third-party/view-image.js";

initImageViewer("#post-content img");

/********** set share function position  分享按钮的响应式布局调整 ***********/
var share = document.getElementById("share-col"); // 分享区容器
var shareIn = document.getElementById("shareButtons"); // 分享按钮容器
var midCol = document.getElementById("mid-col"); // 文章内容区
var postTitles = document.getElementById("titles"); // 文章标题区
var postDate = document.getElementsByClassName("date")[0]; // 文章日期元素

// 根据屏幕宽度调整分享区位置
//效果：在大屏幕上，分享按钮固定在文章侧边；在小屏幕上，自动移动到标题下方，避免侧边栏挤压内容，适配移动端布局。
function setSharePos() {
    if (window.innerWidth < 940) { // 小屏幕（如手机）
        if (sharePos == 1) {
            // 移动分享区到标题下方
            insertAfter(share, postTitles);
            // 移动日期到文章信息区
            document.getElementById("post-information").appendChild(postDate);
            sharePos = 0;
            // 调整分享按钮样式（适应移动端）
            modifyClass(shareIn, "newShare", 1);
        }
    } else { // 大屏幕（如电脑）
        if (sharePos == 0) {
            // 恢复分享区到侧边
            midCol.parentNode.insertBefore(share, midCol);
            // 恢复日期位置
            document.getElementById("first-line").appendChild(postDate);
            sharePos = 1;
            // 恢复分享按钮样式
            modifyClass(shareIn, "newShare", 0);
        }
    }
}
setSharePos();
window.onresize = function() {
    setSharePos();
}

/************* 打赏（二维码切换）功能  **********/
// 元素获取
var qrButton = document.getElementsByClassName("qrButton")[0]; // 切换按钮
var auInfo = document.getElementsByClassName("au-info")[0]; // 作者信息区
var payImg = document.getElementsByClassName("pay-code")[0]; // 二维码图片
var payDiv = document.getElementById("payment-code"); // 打赏二维码容器
var isQB = true; // 状态标记：true=显示作者信息，false=显示打赏码

// 点击按钮切换作者信息/打赏码
qrButton.onclick = function() {
    if (isQB) {
        changeToPerson(qrButton); // 按钮图标切换为“个人”
        isQB = false;
        auInfo.style.display = "none"; // 隐藏作者信息
        payDiv.style.display = "block"; // 显示打赏码
    } else {
        changeToQrcode(qrButton); // 按钮图标切换为“二维码”
        isQB = true;
        auInfo.style.display = "block"; // 显示作者信息
        payDiv.style.display = "none"; // 隐藏打赏码
    }
};


// 打赏方式切换（支付宝/微信/Zelle）
//功能：支持点击按钮切换显示作者信息或打赏二维码，并可在多种打赏方式（支付宝、微信等）间切换，方便读者支持作者。
document.addEventListener('DOMContentLoaded', function() {
    let paymentButtons = document.getElementsByClassName("paymentButtons");
    [...paymentButtons].forEach(function(payBt) {
        payBt.onclick = function() {
            // 移除其他按钮的选中状态
            [...paymentButtons].forEach(otherBt => modifyClass(otherBt, "selected", 0));
            // 选中当前按钮
            modifyClass(payBt, "selected", 1);
            // 切换对应的二维码图片
            let qrCodeUrl = "/img/";
            if (payBt.id === "alipay") qrCodeUrl += "alipay.jpg";
            if (payBt.id === "wechat") qrCodeUrl += "wechat.jpg";
            if (payBt.id === "zelle") qrCodeUrl += "zelle.jpg";
            payImg.src = qrCodeUrl;
        };
    });
});


/*********** 文章目录（TOC）功能 ***********/

var toc = document.getElementById("sidebar-toc"); // 目录容器
var H = 0, Y = toc;
// 计算目录距离页面顶部的初始距离（用于滚动时固定）
while (Y) {
    H += Y.offsetTop;
    Y = Y.offsetParent;
}

// add an unique id to each heading
var uniqId = function(h = 6) {
    let i = 0,
        hn = 1;
    let postCt = document.getElementById("post-content");
    // alert(postCt);
    for (; hn <= h; hn++) {
        let strh = 'h' + hn;
        // alert(strh);
        let heading = postCt.getElementsByTagName(strh);
        for (var j = 0; j < heading.length; j++) {
            heading[j].id = "last-" + i;
            i++;
        }
    }
}

uniqId();

/********** toc fix **********/


menuIcon.onclick = function() {
    var first = this.childNodes[0];
    var second = this.childNodes[1];
    var third = this.childNodes[2];
    var nav = document.getElementById("nav");
    if (menuClickFlag == 0) {
        modifyClass(second, "newSecondLine", 1);
        modifyClass(first, "newFirstLine", 1);
        modifyClass(third, "newThirdLine", 1);
        modifyClass(nav, "newNav", 1);
        modifyClass(menuOuter, "newMenuOuter", 1);
        menuClickFlag = 1;
    } else {
        modifyClass(second, "newSecondLine", 0);
        modifyClass(first, "newFirstLine", 0);
        modifyClass(third, "newThirdLine", 0);
        modifyClass(nav, "newNav", 0);
        menuClickFlag = 0;
        modifyClass(menuOuter, "newMenuOuter", 0);
    }

}


// 监听滚动，固定目录
window.addEventListener("scroll", function() {
    let s = document.body.scrollTop || document.documentElement.scrollTop; // 滚动距离
    if (typeof(toc) !== 'undefined') {
        if (s > H - 100) { // 滚动超过目录初始位置-100px时
            let sidebar = document.getElementById("toc-col");
            let width = sidebar.offsetWidth;
            // 固定目录在顶部50px处，宽度保持原尺寸
            toc.style = `position:fixed;top:50px;width:${width}px`;
        } else {
            // 未滚动到指定位置，取消固定
            toc.style = "";
        }
    }
});

/********* initialize a toc  **********/
// using tocbot API
tocbot.init({
    headingsOffset: 80,
    scrollSmoothOffset: -80,
    // Where to render the table of contents.
    tocSelector: '#tocs', // 放置目录的容器
    // Where to grab the headings to build the table of contents.
    contentSelector: '#post-content', // 正文内容所在
    // Which headings to grab inside of the contentSelector element.
    headingSelector: 'h1, h2, h3, h4, h5', // 需要索引的标题级别
    // scrollSmoothOffset: 50
});


/******** code block style ************/
var codes = document.getElementsByClassName("highlight");
// console.log(codes)
for (var i = 0; i < codes.length; i++) {
    AddLanguageName(codes[i], i);
}

function AddLanguageName(pre, index) {
    var language = pre.className.split(" ")[1].toUpperCase();
    if (language == 'HLJS') language = 'TEXT'
    if (language == 'JS') language = 'JavaScript'
    if (language == 'MD') language = 'MarkDown'
    if (language == 'PY') language = 'PYTHON'

    // if codeblock has a <figcaption></figcaption>
    var Figcaption = pre.querySelector('figcaption');
    console.log(Figcaption);
    if(Figcaption != null) {
        // pre.parentNode.insertBefore(Figcaption, pre);
        pre.removeChild(Figcaption);
    }

    // set code blocks class to help do copy
    var code = pre.children[0].children[0].children[0].children[1];
    code.setAttribute("class", "codeblock-content")
    code.setAttribute("id", "codeblock-" + index.toString())

    
    // add header to the codeblock
    var preHeader = document.createElement("div")
    preHeader.setAttribute("class", "code-block-header")
    var langName = document.createElement("span")
    langName.setAttribute("class", "code-lang")
    langName.innerHTML = language;

    var codeblockButtons = document.createElement("span")
    codeblockButtons.className = "codeblock-buttons"
    codeblockButtons.innerHTML = `
        <span class="code-copy-button" data-index="${index}">
            <i class="fa-solid fa-copy"></i>
        </span>
    `
        // add copy icon 
    var fullscreenBtn = document.createElement("span")
    fullscreenBtn.setAttribute("class", "code-copy-button")
    fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>'
        // var expandIcon = document.createElement("i");
        // expandIcon.className = "fa-solid fa-copy";
        // fullscreenBtn.appendChild(expandIcon);
        // fullscreenBtn.setAttribute("data-index", index)
        // expandIcon.addEventListener('click', copyContents);

    codeblockButtons.appendChild(fullscreenBtn)
    preHeader.appendChild(langName);
    if(Figcaption) {
        while (Figcaption.firstChild) {
            Figcaption.firstChild.setAttribute("class", "code-info")
            preHeader.appendChild(Figcaption.firstChild);
        }
    }
    preHeader.appendChild(codeblockButtons);

    pre.parentNode.insertBefore(preHeader, pre)
    setCodeFullScreen(preHeader, pre, fullscreenBtn)
}


function setCodeFullScreen(preHead, codeblock, btn) {
    btn.addEventListener('click', function() {
        if (codeblock.classList.contains('code-block-fullscreen')) {
            codeblock.classList.remove('code-block-fullscreen');
            preHead.classList.remove('code-head-fullscreen')
            document.documentElement.classList.remove('code-block-fullscreen-html-scroll');
        } else {
            codeblock.classList.add('code-block-fullscreen');
            preHead.classList.add('code-head-fullscreen')
            document.documentElement.classList.add('code-block-fullscreen-html-scroll');
        }
    });
}

window.onload = function() {
    const vquoteElements = document.querySelectorAll('.vquote');
    console.log(vquoteElements)
    vquoteElements.forEach(vquoteElement => {
        console.log(vquoteElement)
        const parentElement = vquoteElement.parentElement;
        parentElement.parentElement.insertBefore(vquoteElement, parentElement.nextSibling);
    });
    console.log(569);
};