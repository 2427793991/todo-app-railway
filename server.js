// 在文件顶部添加
require('dotenv').config();

// MongoDB 连接配置 - 添加调试信息
const mongoUri = process.env.MONGODB_URI || 
                 process.env.MONGO_URL || 
                 process.env.DATABASE_URL ||
                 'mongodb://localhost:27017/todoapp';

// 添加调试输出
console.log('🔍 环境变量 MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
console.log('🔍 环境变量 MONGO_URL:', process.env.MONGO_URL ? '已设置' : '未设置');
console.log('🔍 使用的连接字符串:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

// MongoDB连接
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 添加超时设置
}).then(() => {
    console.log('✅ MongoDB连接成功！');
    console.log('📊 数据库名称:', mongoose.connection.name);
}).catch((err) => {
    console.error('❌ MongoDB连接失败:', err.message);
    // 不要退出进程，让服务继续运行
    // process.exit(1);
});

