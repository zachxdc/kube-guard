# 使用官方 Go 运行时镜像（基于 Alpine，体积小）
FROM golang:1.23-alpine

# 设置工作目录
WORKDIR /app

# 复制当前目录下所有文件到容器里
COPY . .

# 构建 Go 可执行文件
RUN go build -o agent

# 运行可执行文件
CMD ["./agent"]