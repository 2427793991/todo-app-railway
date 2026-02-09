const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB连接 - Railway会自动提供MONGO_URL
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost/todoapp';

// 连接配置
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB连接成功');
}).catch(err => {
  console.error('❌ MongoDB连接失败:', err);
});

// Todo数据模型
const TodoSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
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

// ============ API路由 ============

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 获取所有待办事项
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort('-createdAt');
    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 创建新待办事项
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '标题不能为空'
      });
    }
    
    const todo = new Todo({
      title: title.trim()
    });
    
    await todo.save();
    
    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 更新待办事项状态
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      });
    }
    
    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 删除待办事项
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: '待办事项不存在'
      });
    }
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK',
    service: 'Todo App',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📱 本地访问: http://localhost:${PORT}`);
  console.log(`🌍 网络访问: http://0.0.0.0:${PORT}`);
  console.log(`💾 数据库状态: ${mongoose.connection.readyState === 1 ? '已连接' : '未连接'}`);
});
