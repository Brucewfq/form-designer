# PAI表单设计器angular版本
------
### 开发运行环境

- [Node.js](https://nodejs.org)

#### 检测环境是否安装成功，执行下面的命令显示相应的版本即可
- `node -v`
- `npm -v`

### 如何运行

1. 设置npm的镜像为淘宝镜像

    `npm config set registry https://registry.npm.taobao.org`
    
2. 设置npm下载包的保存前缀

    `npm config set prefix 你的绝对路径`
    
3. 设置环境变量

    在环境变量中将[你的绝对路径]添加到PATH最后
    
4. 安装淘宝cnpm命令，主要用于安装node-sass

    `npm install -g cnpm --registry=https://registry.npm.taobao.org`
    
5. 安装node-sass

    `cnpm install –g node-sass`

6. 安装angular-cli

    `npm install -g @angular/cli`
    
    验证是否安装成功：`ng -v`
    
7. 在项目根目录下执行安装命令

    `npm install`
8. 在项目根目录下执行启动命令

    `npm start`
    
9. 在浏览器中运行

    [http://localhost:4201](http://localhost:4201)

    
### 发布

使用angular-cli的命令进行打包，打包以后的文件在项目根目录下的dist文件夹里

1. 安装typescript

    `npm install -g typescript typings`

2. 在项目根目录下执行命令

    `ng build --environment=prod`


### TODO

1. 使用webpack进行打包发布


