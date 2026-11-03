# CSS Animations · 动效档案

107 个 CSS 动画实验，按 7 类整理。保留原编号和名称，提供可搜索的静态预览集合、播放控制与独立源码。

**当前检查状态：** 静态检查和 8 项逻辑测试通过；浏览器实际渲染复核待完成。详见 [检查报告](docs/REVIEW.md)。

## 开始浏览

在项目根目录运行：

```sh
python3 -m http.server 8107 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8107`。也可以使用 `npm start`，或直接打开根目录 `index.html`（源码查看器的读取与复制需使用 HTTP 服务）。浏览集合不需要安装 npm 依赖，无构建步骤、无 CDN 请求。

- 搜索名称、原编号、分类或标签；`/` 聚焦搜索。
- 按 7 类筛选，每页 12 项；地址保留搜索、分类和页码。
- 点击卡片打开详情，支持暂停、0.5× / 1× / 2×、重播与独立查看 HTML/CSS。
- 只加载滚动到可见区域的预览；离屏预览和后台页面暂停。打开详情时暂停集合预览。
- 遵循系统 `prefers-reduced-motion` 设置；可主动点击“播放动效”开启。
- 6 个原本空白的目录依据名称新增实现，均标记“补全”，并非复原原始效果。

## 分类

| 分类 | 目录 | 数量 |
| --- | --- | ---: |
| 圆环与旋转 | `demos/rings/` | 16 |
| 小球与粒子 | `demos/dots/` | 17 |
| 几何与 3D | `demos/geometry/` | 30 |
| 文字与排版 | `demos/typography/` | 21 |
| 流体与材质 | `demos/liquid/` | 7 |
| 进度与场景 | `demos/scenes/` | 12 |
| SVG 与路径 | `demos/svg/` | 4 |

## 目录结构

```text
index.html              分类预览集合
source.html             安全显示 HTML/CSS 文本的源码查看器
catalog.json            分类、标签、原名与路径的唯一数据源
assets/                 集合样式、控制逻辑、共享缩放与播放控制
demos/<分类>/<原编号>/  独立 index.html、index.css 和本地素材
tools/audit.html        浏览器中运行的 107 项动态检查入口
scripts/                静态检查、逻辑测试与索引同步
docs/                   改动记录与检查结果
```

每个示例的动画在自己的 `index.css` 中。`.demo-stage` 是固定设计画布，共享 `assets/demo.css` 和 `assets/demo.js` 将画布按视口等比缩放，避免破坏示例内部的 3D 变换与伪元素。移植到产品时可取其中的主体元素和样式，并按所在容器调整尺寸。

60、76、87、105 号包含少量原生 JavaScript（计数或场景退场）；其余主要通过 CSS/SVG 动画实现。原先的 jQuery 与 Vue 运行库已移除。在线字体改用本机后备字体，字形会随系统略有差别。

## 维护和检查

需要 Node.js 22+、Python 3。npm 包只用于开发检查：

```sh
npm ci
npm run check
```

修改 `catalog.json` 后运行 `npm run sync`，同步可直接在 `file://` 下使用的 `assets/catalog.js`。

`npm run check` 验证全部 107 项的索引、资源路径、CSS 语法、关键帧引用和偏移重复情况，并测试分类、搜索、懒加载、详情重播、计数器、播放速度、暂停和减少动态效果逻辑。DOM 逻辑测试不进行像素渲染。

浏览器复核入口为 `http://127.0.0.1:8107/tools/audit.html`。运行后可保存 JSON 报告，再人工确认集合各页、移动视口和完整场景。`d: path()`、倒影、滤镜、混合模式等效果需以目标浏览器为准；10 号保留 SVG `d` 属性作为静态路径后备。

项目可直接部署到支持静态文件的服务。尚未自动配置线上部署或 GitHub Pages。

## 原始材料与授权

项目来自用户提供的 `css-107` 文件集合。Git 的原始导入提交保存了 `src/` 与 `static/`。整理后的路径、原编号和原名可在下表及 `catalog.json` 对照。IDE 配置、系统文件、临时实验与机器专属生成脚本不纳入项目。

原始集合未附作者、来源链接或许可证，故此项目没有擅自添加覆盖全部原代码的开源许可证。

## 全部示例索引

| 编号 | 动画 | 分类 | 备注 |
| ---: | --- | --- | --- |
| 001 | [旋转变色效果](demos/rings/001/index.html) | 圆环与旋转 |  |
| 002 | [毛玻璃效果](demos/liquid/002/index.html) | 流体与材质 |  |
| 003 | [文本填充效果](demos/typography/003/index.html) | 文字与排版 |  |
| 004 | [攀爬效果1](demos/geometry/004/index.html) | 几何与 3D |  |
| 005 | [攀爬效果2](demos/dots/005/index.html) | 小球与粒子 |  |
| 006 | [拖影效果](demos/geometry/006/index.html) | 几何与 3D | 位移动画优化 |
| 007 | [流体加载效果](demos/liquid/007/index.html) | 流体与材质 |  |
| 008 | [发光渐变加载环效果](demos/rings/008/index.html) | 圆环与旋转 | 修复光晕层定位 |
| 009 | [蛇形边框加载效果](demos/geometry/009/index.html) | 几何与 3D | 位移动画优化 |
| 010 | [SVG弹性线动画效果](demos/svg/010/index.html) | SVG 与路径 |  |
| 011 | [跳动小球](demos/dots/011/index.html) | 小球与粒子 | 恢复纵向弹跳动画 |
| 012 | [3D旋转动画效果](demos/geometry/012/index.html) | 几何与 3D |  |
| 013 | [闪烁文字效果](demos/typography/013/index.html) | 文字与排版 |  |
| 014 | [双重加载环动画](demos/rings/014/index.html) | 圆环与旋转 |  |
| 015 | [雷达扫描动画](demos/scenes/015/index.html) | 进度与场景 |  |
| 016 | [装满水的杯子](demos/liquid/016/index.html) | 流体与材质 | 按名称补全 |
| 017 | [3D旋转方块加载动画效果](demos/geometry/017/index.html) | 几何与 3D |  |
| 018 | [加载带有更改背景颜色的进度条](demos/scenes/018/index.html) | 进度与场景 | 位移动画优化 |
| 019 | [3D文字跳跃动画](demos/typography/019/index.html) | 文字与排版 |  |
| 020 | [彩虹加载页面动画](demos/rings/020/index.html) | 圆环与旋转 |  |
| 021 | [简单文字跳动1](demos/typography/021/index.html) | 文字与排版 | 按名称补全 |
| 022 | [简单文字跳动2](demos/typography/022/index.html) | 文字与排版 |  |
| 023 | [小球跳动加载](demos/dots/023/index.html) | 小球与粒子 |  |
| 024 | [淡入淡出文本Css动画](demos/typography/024/index.html) | 文字与排版 |  |
| 025 | [动画效果1（2017）](demos/geometry/025/index.html) | 几何与 3D |  |
| 026 | [动画效果2（2017）](demos/geometry/026/index.html) | 几何与 3D |  |
| 027 | [浮动文本加载效果](demos/typography/027/index.html) | 文字与排版 |  |
| 028 | [线加载动画](demos/scenes/028/index.html) | 进度与场景 |  |
| 029 | [Css闪烁文字效果](demos/typography/029/index.html) | 文字与排版 |  |
| 030 | [简单加载动画](demos/rings/030/index.html) | 圆环与旋转 |  |
| 031 | [旋转轮子动画](demos/rings/031/index.html) | 圆环与旋转 |  |
| 032 | [光加载环动画效果](demos/rings/032/index.html) | 圆环与旋转 | 修正重复的 0% 关键帧 |
| 033 | [常见加载效果](demos/dots/033/index.html) | 小球与粒子 |  |
| 034 | [四面反转](demos/geometry/034/index.html) | 几何与 3D |  |
| 035 | [黄色和黑色箭头符号加载动画](demos/geometry/035/index.html) | 几何与 3D |  |
| 036 | [自定义动画1](demos/typography/036/index.html) | 文字与排版 |  |
| 037 | [用水填充文本](demos/liquid/037/index.html) | 流体与材质 | 按名称补全 |
| 038 | [简单预加载](demos/rings/038/index.html) | 圆环与旋转 |  |
| 039 | [加载文本动画](demos/typography/039/index.html) | 文字与排版 | 位移动画优化 |
| 040 | [纯CSS铅笔笔划加载程序动画](demos/svg/040/index.html) | SVG 与路径 |  |
| 041 | [简单预加载2](demos/rings/041/index.html) | 圆环与旋转 |  |
| 042 | [绿色进度条加载](demos/scenes/042/index.html) | 进度与场景 |  |
| 043 | [加载文本动画](demos/typography/043/index.html) | 文字与排版 | 位移动画优化 |
| 044 | [滑动六边形加载动画](demos/geometry/044/index.html) | 几何与 3D |  |
| 045 | [边框线条动画](demos/geometry/045/index.html) | 几何与 3D |  |
| 046 | [文字加载动画](demos/typography/046/index.html) | 文字与排版 |  |
| 047 | [水球](demos/liquid/047/index.html) | 流体与材质 |  |
| 048 | [圆环](demos/rings/048/index.html) | 圆环与旋转 | 位移动画优化 |
| 049 | [两点](demos/dots/049/index.html) | 小球与粒子 | 位移动画优化 |
| 050 | [四点](demos/dots/050/index.html) | 小球与粒子 | 位移动画优化 |
| 051 | [发光点](demos/dots/051/index.html) | 小球与粒子 |  |
| 052 | [发光环](demos/rings/052/index.html) | 圆环与旋转 |  |
| 053 | [翻转加载动画](demos/geometry/053/index.html) | 几何与 3D |  |
| 054 | [移动块动画效果](demos/geometry/054/index.html) | 几何与 3D | 位移动画优化 |
| 055 | [循环加载动画](demos/rings/055/index.html) | 圆环与旋转 |  |
| 056 | [折叠立方体动画效果](demos/geometry/056/index.html) | 几何与 3D |  |
| 057 | [多个旋转小球](demos/dots/057/index.html) | 小球与粒子 |  |
| 058 | [Css彩色小球加载页面动画](demos/dots/058/index.html) | 小球与粒子 |  |
| 059 | [方块加载动画](demos/geometry/059/index.html) | 几何与 3D | 位移动画优化 |
| 060 | [如何在jQuery中创建预加载屏幕](demos/scenes/060/index.html) | 进度与场景 | 移除 jQuery，补充可重播场景 |
| 061 | [CSS点加载动画](demos/dots/061/index.html) | 小球与粒子 |  |
| 062 | [CSS单元素彩色微调器](demos/rings/062/index.html) | 圆环与旋转 |  |
| 063 | [Css3加载页面动画](demos/geometry/063/index.html) | 几何与 3D |  |
| 064 | [发射效果](demos/dots/064/index.html) | 小球与粒子 |  |
| 065 | [弹跳的球](demos/dots/065/index.html) | 小球与粒子 |  |
| 066 | [使用Clip-path分割加载文本动画效果](demos/typography/066/index.html) | 文字与排版 |  |
| 067 | [旋转色盘](demos/rings/067/index.html) | 圆环与旋转 |  |
| 068 | [文字加载动画](demos/typography/068/index.html) | 文字与排版 |  |
| 069 | [牛顿摇篮动画效果](demos/dots/069/index.html) | 小球与粒子 |  |
| 070 | [四个方块](demos/geometry/070/index.html) | 几何与 3D |  |
| 071 | [CSS复杂加载程序动画效果](demos/geometry/071/index.html) | 几何与 3D |  |
| 072 | [小球加载动画效果](demos/dots/072/index.html) | 小球与粒子 |  |
| 073 | [3D旋转动画效果](demos/geometry/073/index.html) | 几何与 3D |  |
| 074 | [小球加载动画效果](demos/dots/074/index.html) | 小球与粒子 |  |
| 075 | [渐入渐出效果](demos/typography/075/index.html) | 文字与排版 |  |
| 076 | [动画数字计数器预加载程序](demos/scenes/076/index.html) | 进度与场景 | 按名称补全 |
| 077 | [迷宫动画效果](demos/geometry/077/index.html) | 几何与 3D | 位移动画优化 |
| 078 | [文字加载动画](demos/typography/078/index.html) | 文字与排版 | 位移动画优化 |
| 079 | [无限铅笔加载程序动画效果](demos/geometry/079/index.html) | 几何与 3D |  |
| 080 | [发光文字动画效果2](demos/typography/080/index.html) | 文字与排版 | 修正动画名称拼写 |
| 081 | [零碰撞CSS动画效果](demos/dots/081/index.html) | 小球与粒子 |  |
| 082 | [CSS方形动画效果](demos/geometry/082/index.html) | 几何与 3D |  |
| 083 | [Neumorphism 动画效果](demos/liquid/083/index.html) | 流体与材质 |  |
| 084 | [全屏页面加载程序动画](demos/scenes/084/index.html) | 进度与场景 |  |
| 085 | [老式电影倒计时](demos/scenes/085/index.html) | 进度与场景 | 修复倒计时数字重叠 |
| 086 | [文本阴影](demos/typography/086/index.html) | 文字与排版 |  |
| 087 | [全屏数字计数器预加载程序](demos/scenes/087/index.html) | 进度与场景 | 移除 jQuery，改用动画帧计数 |
| 088 | [CSS旋转方形加载程序动画效果](demos/geometry/088/index.html) | 几何与 3D |  |
| 089 | [无线加载动画](demos/dots/089/index.html) | 小球与粒子 |  |
| 090 | [3D波浪圆加载动画效果](demos/geometry/090/index.html) | 几何与 3D |  |
| 091 | [3D波浪圆加载器动画效果](demos/geometry/091/index.html) | 几何与 3D | 按名称补全 |
| 092 | [3D加载动画效果](demos/geometry/092/index.html) | 几何与 3D | 修正重复的 75% 关键帧 |
| 093 | [3D 旋转动画效果](demos/geometry/093/index.html) | 几何与 3D |  |
| 094 | [全屏擦除页面加载动画](demos/scenes/094/index.html) | 进度与场景 | 修复擦除结束状态 |
| 095 | [文字加载动画效果](demos/typography/095/index.html) | 文字与排版 |  |
| 096 | [波浪圆动画加载效果](demos/geometry/096/index.html) | 几何与 3D | 按名称补全 |
| 097 | [快速加载CSS和SVG动画效果](demos/svg/097/index.html) | SVG 与路径 |  |
| 098 | [SVG 加载动画效果](demos/svg/098/index.html) | SVG 与路径 |  |
| 099 | [流体加载动画效果](demos/liquid/099/index.html) | 流体与材质 |  |
| 100 | [全屏页面加载动画效果](demos/scenes/100/index.html) | 进度与场景 |  |
| 101 | [发光文字加载效果](demos/typography/101/index.html) | 文字与排版 |  |
| 102 | [CSS 加载页面动画效果](demos/rings/102/index.html) | 圆环与旋转 |  |
| 103 | [CSS3发光渐变加载环动画效果](demos/rings/103/index.html) | 圆环与旋转 |  |
| 104 | [CSS 波浪文字加载效果](demos/typography/104/index.html) | 文字与排版 |  |
| 105 | [使用Html、CSS和Jquery的数字计数器预加载程序](demos/scenes/105/index.html) | 进度与场景 | 移除 jQuery，改用动画帧计数 |
| 106 | [CSS3蛇边界加载动画效果2](demos/geometry/106/index.html) | 几何与 3D |  |
| 107 | [快速CSS涟漪动画效果](demos/geometry/107/index.html) | 几何与 3D | 修复多余闭合标签与涟漪布局 |
