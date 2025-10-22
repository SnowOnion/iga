# 票务管理系统

基于 Go + Gin 框架的票务管理系统，支持余票和总票数的实时管理。

## 功能特性

- ✅ 三个时段的票务管理（9:00-13:00、13:00-17:00、17:00-20:00）
- ✅ 余票编辑模式
- ✅ 总票数编辑模式
- ✅ 实时数据刷新
- ✅ 自动模拟预约增长（每秒随机增加 0-3 个预约）
- ✅ 数据验证（余票 ≥ 0，总票数 ≥ 预约人数）

## 快速开始

### 安装依赖

```bash
go mod download
```

### 运行服务

```bash
go run main.go
```

### 访问系统

打开浏览器访问：http://localhost:8080

## API 接口

### 1. 获取票务数据
```
GET /api/tickets
```

### 2. 更新余票
```
POST /api/tickets/remaining
Content-Type: application/json

{
  "remaining": [70, 40, 0]
}
```

### 3. 更新总票数
```
POST /api/tickets/total
Content-Type: application/json

{
  "total": [100, 100, 100]
}
```

## 项目结构

```
ticketing/
├── main.go           # 后端服务主文件
├── go.mod            # Go 模块依赖
├── README.md         # 项目说明
└── static/
    └── index.html    # 前端页面
```

## 技术栈

- **后端**: Go 1.21 + Gin
- **前端**: HTML + JavaScript + TailwindCSS
- **数据存储**: 内存
