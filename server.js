const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataFile = path.join(__dirname, 'data/threads.json');

// Helper untuk baca file JSON
function readThreads(){
  if(!fs.existsSync(dataFile)){
    fs.writeFileSync(dataFile, JSON.stringify([]));
  }
  const raw = fs.readFileSync(dataFile);
  return JSON.parse(raw);
}

// Helper untuk tulis file JSON
function writeThreads(data){
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// GET semua thread
app.get('/api/threads', (req,res)=>{
  const threads = readThreads();
  res.json(threads);
});

// POST komentar baru
app.post('/api/threads/:id/comments', (req,res)=>{
  const threads = readThreads();
  const threadId = parseInt(req.params.id);
  const thread = threads.find(t => t.id === threadId);
  if(!thread) return res.status(404).json({success:false, message:"Thread tidak ditemukan"});

  const {name,text} = req.body;
  if(!name || !text) return res.status(400).json({success:false,message:"Nama & komentar diperlukan"});

  thread.comments.push({name,text,date:new Date().toISOString()});
  writeThreads(threads);
  res.json({success:true, message:"Komentar berhasil ditambahkan"});
});

// POST thread baru
app.post('/api/threads', (req,res)=>{
  const threads = readThreads();
  const {title, author} = req.body;
  if(!title || !author) return res.status(400).json({success:false,message:"Title & author diperlukan"});

  const id = threads.length ? threads[threads.length-1].id + 1 : 1;
  threads.push({id,title,author,date:new Date().toISOString(),comments:[]});
  writeThreads(threads);
  res.json({success:true,message:"Thread berhasil dibuat",threadId:id});
});

app.listen(PORT,()=>console.log(`Server berjalan di http://localhost:${PORT}`));
