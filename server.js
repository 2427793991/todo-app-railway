// 在文件顶部
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB 连接 - 添加更多调试
const mongoUri = process.env.MONGODB_URI || 
                 process.env.MONGO_URL || 
                 process.env.DATABASE_URL ||
                 'mongodb://mongo:27017/todoapp';  // 使用 'mongo' 作为主机名

console.log('🔍 正在连接到 MongoDB...');
console.log('🔍 连接字符串:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,  // 增加超时时间
    socketTimeoutMS: 45000,
}).then(() => {
    console.log('✅ MongoDB连接成功！');
    console.log('📊 数据库名称:', mongoose.connection.name);
}).catch((err) => {
    console.error('❌ MongoDB连接失败:', err.message);
    console.error('详细错误:', err);
    // 继续运行服务器，即使数据库连接失败
});

// ... 其余代码保持不变 ...

// 启动服务器 - 重要更新！
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`✅ 服务器启动成功！`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        mongoose.connection.close(false, () => {
            console.log('MongoDB 连接已关闭');
            process.exit(0);
        });
    });
});
