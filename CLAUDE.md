# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

独立 Web App，用于管理 Mobile Installer 团队。Installer 是品牌签约的安装技师，负责安装产品并拍摄素材。

与 UGC 系统（ugc-acumen）共享同一个 Supabase PostgreSQL 数据库和 Cloudflare R2 存储，通过 Instagram username 关联数据。

### 核心功能

**Admin Portal（/admin/*）：**
- 管理 installer 账号（创建、状态流转：applied → approved → active → inactive）
- 审核 installer 上传的素材（approve / reject）
- 查看 installer 关联的 Instagram UGC（从共享的 Mention 表读取）
- 关联 installer 到 Shopify Customer

**Installer Portal（/portal/*）：**
- Installer 用邮箱密码登录
- 上传视频/图片素材给 admin 审核
- 查看素材状态和个人信息

### 与 UGC 系统的关系

```
ugc-acumen (Shopify Embedded App)     installer-portal (独立 Web App)
├── Instagram 抓取 → Mention 表  ←──── Installer 详情页读取 UGC
├── Creator 管理 → CreatorLink 表 ←──── Installer 关联 Instagram username
├── R2 媒体存储                  ←──── Installer 素材上传到同一个 R2
└── 独立部署                           独立部署
```

- Installer 是 Creator 的子集：installer 的 Instagram tag 内容自动出现在 UGC 系统
- 两个项目共享数据库，Installer 系统不修改 UGC 侧的表（Mention、CreatorLink、VisibleMention）
- InstallerUpload 审核通过后，可选择性转入 VisibleMention 用于前端展示

## Commands

- **Dev server**: `npm run dev` (Next.js dev server, default port 3000)
- **Build**: `npm run build`
- **Start production**: `npm run start`
- **Lint**: `npm run lint`
- **Prisma generate**: `npx prisma generate`
- **Prisma migrate**: `npx prisma migrate deploy`

No test framework is configured.

## Architecture

**Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS

**Key directories**:
- `src/app/(admin)/admin/` — Admin 页面（installer 列表、详情、登录）
- `src/app/(installer)/` — Installer 页面（登录、portal、上传、个人信息）
- `src/app/api/` — API 路由
- `src/lib/` — 服务端工具（数据库、认证、R2 上传）
- `prisma/` — Schema（Installer 系统表 + 共享 UGC 表定义）

**Routing**:
- `/admin/login` — Admin 登录
- `/admin/installers` — Installer 列表
- `/admin/installers/[id]` — Installer 详情（素材审核 + UGC）
- `/login` — Installer 登录
- `/portal` — Installer 首页
- `/portal/upload` — 上传素材
- `/portal/profile` — 个人信息

**Authentication**:
- JWT + httpOnly cookie，Admin 和 Installer 分开的 cookie
- Admin 认证：环境变量 `ADMIN_EMAIL` / `ADMIN_PASSWORD`（后续可改为数据库管理）
- Installer 认证：邮箱 + bcrypt 密码哈希
- 未来计划：Magic Link 快速登录

**Data Models**:
- `Installer` — installer 账号（email、密码、Instagram username、状态、区域等）
- `InstallerUpload` — 上传的素材（文件 URL、状态、审核备注）
- `Mention` / `Comment` / `CreatorLink` / `VisibleMention` — 共享 UGC 表（只读）

**Media Storage**: 素材上传到 Cloudflare R2，路径为 `installer-uploads/{installerId}/{timestamp}.{ext}`

## Environment Variables

Required:
- `DATABASE_URL` — Supabase PostgreSQL（与 ugc-acumen 共享）
- `JWT_SECRET` — JWT 签名密钥
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Admin 登录凭据
- `CF_R2_ACCOUNT_ID` / `CF_R2_ACCESS_KEY_ID` / `CF_R2_SECRET_ACCESS_KEY` — R2 认证
- `CF_R2_BUCKET` / `CF_R2_PUBLIC_BASE` — R2 存储桶和公开 URL

## Patterns

- Admin API 路由统一检查 `getAdminFromCookie()`，未认证返回 401
- Installer API 路由检查 `getInstallerFromCookie()`
- 文件上传通过 FormData，服务端转存到 R2
- Prisma client 使用全局单例模式避免开发环境连接泄漏
- 共享表在 schema 中定义但只读，由 ugc-acumen 负责写入和维护
