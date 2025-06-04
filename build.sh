#!/bin/bash

# 设置默认值
client_id=${1}
image_author="asing1elife"

if [ "$client_id" == '' ]; then
    echo "Please provide the client_id as the first argument."
    exit 1
fi

echo "docker buildx build --build-arg VITE_GOOGLE_CLIENT_ID=$client_id --platform linux/arm64 -t $image_author/deploybot-web-console:latest --push ."

# 执行 Docker 命令
docker buildx build --build-arg VITE_GOOGLE_CLIENT_ID=$client_id --platform linux/arm64 -t $image_author/deploybot-web-console:latest --push .
