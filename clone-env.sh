#!/bin/bash

# Kiểm tra xem file .env đã tồn tại chưa
if [ -f ".env" ]; then
  echo ".env file đã tồn tại. Nếu muốn ghi đè, vui lòng xóa file .env trước."
  exit 1
fi

# Sao chép nội dung từ .env.dev sang .env
cp .env.dev .env

# Thông báo hoàn tất
echo "File .env đã được tạo từ .env.dev"
echo "Các biến môi trường chính:"
grep -E 'NODE_ENV|MONGO_URI|APP_NAME|PORT' .env
