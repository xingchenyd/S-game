# 剧场本地字体

- `story-brush.woff2`：由 [Ma Shan Zheng](https://github.com/googlefonts/mashanzheng) 字体子集化，用于剧情标题、地点与角色名。
- `story-kai.woff2`：由 [霞鹜文楷](https://github.com/lxgw/LxgwWenKai) Regular 子集化，用于对白、笔记和选项。

均随附上游 SIL OFL 1.1 许可，修改后的网页子集使用 SGame Story Brush / SGame Story Kai 家族名，不用于作为独立字体销售。仅在剧场使用，从本站加载，无外部字体服务请求。

生成：将上述仓库的原始 TTF 下载到 `.cache/story-fonts`，运行 `python scripts/build_story_fonts.py .cache/story-fonts`。脚本按 `src` 中实际字符制作 WOFF2；新增剧情后应重跑。未收录字符仍有系统字体回退。
