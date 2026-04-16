# Blog Back Service

`blog-back-service` 是一个基于 **NestJS** 构建的高性能、模块化博客后端服务。

## 🌟 项目简介

本项目旨在为个人或中小型团队提供一个稳定、易扩展的博客后端解决方案。支持以下核心特性：
- **文章管理**：支持 Markdown 全文本存储、封面图管理及发布流管理。
- **分类体系**：支持多级分类与灵活的标签系统。
- **统计分析**：内置文章、分类及各维度数据统计模块。
- **媒体托管**：集成本地静态资源服务与 Sharp 图像处理优化。
- **安全体系**：基于 JWT 的全局鉴权、Bcrypt 密码加密及严格的 DTO 校验。

## 🛠 环境依赖

在运行项目之前，请确保您的系统中已安装以下软件：

| 依赖项         | 建议版本 | 说明                |
| :------------- | :------- | :------------------ |
| **Node.js**    | >= 18.x  | 推荐使用 LTS 版本   |
| **npm / pnpm** | >= 9.x   | 包管理工具          |
| **PostgreSQL** | >= 14.x  | 主数据库            |
| **Redis**      | >= 6.x   | 缓存与 Session 管理 |

## 🏗 项目架构

项目严格遵循 NestJS 模块化规范，核心结构如下：

```text
src/
├── blog/             # 博客核心业务
│   ├── article/      # 文章管理
│   ├── category/     # 分类管理
│   ├── tag/          # 标签管理
│   └── statistics/   # 数据统计
├── user/             # 用户管理及鉴权 (Auth)
├── system/           # 系统基础设施
│   ├── upload/       # 文件上传逻辑
│   └── media/        # 媒体资源处理
├── common/           # 公共逻辑 (Guards, Decorators, Filters, DTOs)
├── redis/            # Redis 缓存封装
├── sql/              # 数据库底层与初始化
└── main.ts           # 应用入口
```

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
复制环境变量文件并修改配置（数据库、Redis、JWT 密钥等）：
```bash
cp .env.development .env
```

### 3. 数据库迁移
运行数据库迁移以初始化表结构：
```bash
npm run migration:run:dev
```

### 4. 启动服务
```bash
# 开发模式
npm run start:dev

# 生产模式编译
npm run build
npm run start:prod
```

## 📖 API 文档
项目启动后，可以通过以下路径访问在线 Swagger 文档：
`http://localhost:<PORT>/api/api-docs` (具体取决于 main.ts 中的 Swagger 配置)

## 🛡 开发规范
- **代码校验**：所有输入数据必须经过 `Zod` DTO 校验。
- **时区**：数据库字段必须使用 `timestamptz` 类型。
- **日志**：项目集成 Winston 分级日志管理，可在 `logs/` 目录下查看。

## 项目运行步骤
- 1.npm install
- 2.安装PostgreSql,并手动创建数据库，在.env.development文件中配置数据库连接信息。
- 3.安装Redis,并手动创建数据库，在.env.development文件中配置Redis连接信息。
- 4.运行数据库迁移：npm run migration:run:dev
- 5.启动服务：npm run start:dev

---
由 **Antigravity** 协助驱动。
