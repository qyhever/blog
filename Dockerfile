# 构建阶段

FROM node:20-alpine as build-stage

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 从构建阶段复制构建结果到nginx目录
COPY --from=build-stage /app/docs/.vuepress/dist /usr/share/nginx/html

# 配置nginx
RUN echo '\
server { \
    listen 8080; \
    server_name localhost; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
        access_log off; \
    } \
    \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
} \
' > /etc/nginx/conf.d/default.conf

# 暴露8080端口
EXPOSE 8080

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]