require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== MongoDB =====
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.error(err));

// ===== Models =====
const commentSchema = new mongoose.Schema({
  name: String,
  text: String,
  date: {type: Date, default: Date.now}
});

const threadSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: {type: Date, default: Date.now},
  comments: [commentSchema]
});

const Thread = mongoose.model("Thread", threadSchema);

// ===== Routes API =====

// Get semua thread
app.get('/api/threads', async (req,res)=>{
  const threads = await Thread.find().sort({date:-1});
  res.json(threads);
});

// Post thread baru
app.post('/api/threads', async (req,res)=>{
  const {title, author} = req.body;
  if(!title || !author) return res.status(400).json({success:false, message:"Title & author dibutuhkan"});
  const thread = new Thread({title, author});
  await thread.save();
  res.json({success:true, thread});
});

// Post komentar baru
app.post('/api/threads/:id/comments', async (req,res)=>{
  const {name, text} = req.body;
  if(!name || !text) return res.status(400).json({success:false, message:"Nama & komentar dibutuhkan"});
  const thread = await Thread.findById(req.params.id);
  if(!thread) return res.status(404).json({success:false, message:"Thread tidak ditemukan"});
  thread.comments.push({name,text});
  await thread.save();
  res.json({success:true, message:"Komentar berhasil ditambahkan"});
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
