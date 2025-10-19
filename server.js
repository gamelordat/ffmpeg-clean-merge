import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });

// دمج الفيديو مع الصوت الجديد (بدون الصوت الأصلي)
app.post("/merge", upload.fields([{ name: "video" }, { name: "audio" }]), (req, res) => {
  if (!req.files.video || !req.files.audio) {
    return res.status(400).send("Missing video or audio file");
  }

  const videoPath = req.files.video[0].path;
  const audioPath = req.files.audio[0].path;
  const outputPath = `merged_${Date.now()}.mp4`;

  const cmd = `ffmpeg -y -i ${videoPath} -i ${audioPath} -c:v copy -map 0:v:0 -map 1:a:0 ${outputPath}`;

  exec(cmd, (error) => {
    if (error) {
      console.error("❌ FFmpeg Error:", error);
      return res.status(500).send("Error merging files");
    }

    res.sendFile(path.resolve(outputPath), (err) => {
      // حذف الملفات بعد الإرسال لتوفير مساحة
      fs.unlink(videoPath, () => {});
      fs.unlink(audioPath, () => {});
      fs.unlink(outputPath, () => {});
    });
  });
});

app.get("/", (req, res) => res.send("✅ FFmpeg Merge API is running"));
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
