dist_path="docs/.vuepress/dist"
server_name="pinco"
server_static_dic="/usr/local/src/nginx-1.12.2/html"
scp -r $dist_path/assets $server_name:$server_static_dic
scp -r $dist_path/pages $server_name:$server_static_dic
scp $dist_path/index.html $server_name:$server_static_dic