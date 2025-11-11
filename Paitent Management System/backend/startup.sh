#!/bin/bash
echo "Copying custom Nginx configuration"
cp /home/site/wwwroot/nginx.conf /etc/nginx/sites-available/default
echo "Reloading Nginx"
nginx -s reload

echo "Starting FastAPI/Uvicorn server"
cd /home/site/wwwroot/fastapi
pip install -r requirements.txt
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 > /home/site/wwwroot/fastapi.log 2>&1 &

echo "FastAPI started on port 8000"
