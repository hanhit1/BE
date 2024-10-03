#!/bin/bash
cp .env.dev .env
echo "File .env đã được tạo từ .env.dev"
echo "Các biến môi trường chính:"
grep -E 'NODE_ENV|MONGO_URI|APP_NAME|PORT' .env
