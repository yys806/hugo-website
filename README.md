# 珅哥网址导航

基于 [Hugo](https://gohugo.io/) 与 [WebStack-Hugo](https://github.com/shenweiyan/WebStack-Hugo) 主题搭建的纯静态网址导航站。

- 在线地址:<https://hugo-website-three.vercel.app/>
- 仓库地址:<https://github.com/yys806/hugo-website>

## 目录结构

```text
.
├── config.toml          # 站点配置(标题、SEO、页脚、侧边栏链接等)
├── content/
│   └── about.md         # "关于导航"页面内容
├── data/
│   ├── webstack.yml     # 导航网址数据(分类、站点、logo、描述)
│   ├── headers.yml      # 顶部导航配置
│   └── friendlinks.yml  # 友情链接
├── themes/
│   └── WebStack-Hugo/   # 主题(布局模板与静态资源)
├── public/              # 构建产物(已入库,线上直接使用,勿手改)
├── netlify.toml         # Netlify 构建配置
└── hugo.exe             # 随仓库携带的 Hugo 可执行文件(v0.149.0,Windows)
```

## 本地开发

本仓库自带 `hugo.exe`(Windows 版,v0.149.0),无需全局安装 Hugo:

```powershell
# 本地预览(默认 http://localhost:1313)
./hugo.exe server

# 构建站点(输出到 public/,与线上保持同步)
./hugo.exe --minify
```

修改 `config.toml`、`data/*.yml`、`content/` 或主题后,务必重新执行
`./hugo.exe --minify` 并将 `public/` 的变更一并提交,保证构建产物与源码同步。

## 维护导航内容

- 增删导航网址:编辑 `data/webstack.yml`,按分类添加站点名称、链接、logo 与描述;
- 站点 logo 存放在 `themes/WebStack-Hugo/static/assets/images/logos/`;
- 友情链接:编辑 `data/friendlinks.yml`;
- 页脚、侧边栏"网站提交 / 关于导航"链接:编辑 `config.toml` 中 `[params]` 与 `[params.footer]`。

## 部署

推送到 `main`/`master` 后由托管平台自动构建(见 `netlify.toml`,Hugo 0.149.0,
命令 `hugo --minify`,发布目录 `public`);`public/` 同时入库,便于纯静态托管直接使用。

## 致谢

- 主题:[WebStack-Hugo](https://github.com/shenweiyan/WebStack-Hugo)(遵循其开源许可,见 `LICENSE`)
- 原始设计:[WebStack](https://github.com/WebStackPage/WebStackPage.github.io)
