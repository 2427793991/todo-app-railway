// 在文件顶部添加所有必需的导入
const express = require('express');
const mongoose = require('mongoose');  // ← 添加这行！
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();  // ← 添加这行！

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB 连接配置 - 添加调试信息
const mongoUri = process.env.MONGODB_URI || 
                 process.env.MONGO_URL || 
                 process.env.DATABASE_URL ||
                 'mongodb://localhost:27017/todoapp';

// 添加调试输出
console.log('🔍 环境变量 MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
console.log('🔍 环境变量 MONGO_URL:', process.env.MONGO_URL ? '已设置' : '未设置');
console.log('🔍 使用的连接字符串:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

// MongoDB连接 - 注意是 mongoose 不是 mongoose！
mongoose.connect(mongoUri, {  // ← 修正拼写错误
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log('✅ MongoDB连接成功！');
    console.log('📊 数据库名称:', mongoose.connection.name); // ← 修正拼写
}).catch((err) => {
    console.error('❌ MongoDB连接失败:', err.message);
    // 不要退出进程，让服务继续运行
    // process.exit(1);
});

// Todo 模型定义
const TodoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('Todo', TodoSchema);

// API 路由
// 获取所有待办事项
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建新的待办事项
app.post('/api/todos', async (req, res) => {
    try {
        const todo = new Todo({
            text: req.body.text
        });
        const savedTodo = await todo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 更新待办事项状态
app.put('/api/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { completed: req.body.completed },
            { new: true }
        );
        res.json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 删除待办事项
app.delete('/api/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 所有其他路由返回首页
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📱 本地访问: http://localhost:${PORT}`);
});
