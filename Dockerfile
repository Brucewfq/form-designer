FROM daocloud.io/nginx
COPY dist /usr/share/nginx/html
RUN chmod -R 777 /usr/share/nginx/html/
