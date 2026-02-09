// 在文件顶部添加所有必需的导入
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 中间件配置 ✅ (位置正确)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // 👈 添加这行以支持表单提交
app.use(express.static('public'));

// MongoDB 连接配置 ✅ (代码正确)
const mongoUri = process.env.MONGODB_URI || 
                 process.env.MONGO_URL || 
                 process.env.DATABASE_URL ||
                 'mongodb://localhost:27017/todoapp';

// 调试输出 ✅ (已经有了)
console.log('🔍 环境变量 MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
console.log('🔍 环境变量 MONGO_URL:', process.env.MONGO_URL ? '已设置' : '未设置');
console.log('🔍 使用的连接字符串:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

// MongoDB连接 ✅ (代码正确)
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log('✅ MongoDB连接成功！');
    console.log('📊 数据库名称:', mongoose.connection.name);
}).catch((err) => {
    console.error('❌ MongoDB连接失败:', err.message);
});

// Todo 模型定义 ✅ (代码正确)
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
// 获取所有待办事项 ✅
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建新的待办事项 👈 更新这个部分
app.post('/api/todos', async (req, res) => {
    try {
        // 添加调试日志
        console.log('📥 收到 POST 请求');
        console.log('📦 请求体:', req.body);
        console.log('📋 Content-Type:', req.headers['content-type']);
        
        // 验证输入
        if (!req.body.text || req.body.text.trim() === '') {
            console.log('❌ 文本为空');
            return res.status(400).json({ 
                error: '待办事项内容不能为空' 
            });
        }
        
        const todo = new Todo({
            text: req.body.text.trim()
        });
        
        const savedTodo = await todo.save();
        console.log('✅ 保存成功:', savedTodo);
        
        res.status(201).json(savedTodo);
    } catch (error) {
        console.error('❌ 保存失败:', error);
        res.status(400).json({ error: error.message });
    }
});

// 其余代码保持不变...
