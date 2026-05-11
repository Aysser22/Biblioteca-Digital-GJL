import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs/promises";
import { createWorker } from "tesseract.js";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let worker;

async function initializeWorker() {
  worker = await createWorker({ logger: (m) => console.log(m) });
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
}

function extractTitle(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 4);

  const titleCandidate = lines.find((line) => /[A-Za-zÀ-ú]/.test(line));
  return titleCandidate || "";
}

function extractIsbn(text) {
  const match = text.match(/(97[89][\- ]?\d{1,5}[\- ]?\d{1,7}[\- ]?\d{1,7}[\- ]?[\dX])/i);
  return match ? match[0].replace(/\s+/g, "") : "";
}

app.post("/extract", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Arquivo de imagem não enviado." });
  }

  try {
    const { data } = await worker.recognize(req.file.path);
    const title = extractTitle(data.text);
    const isbn = extractIsbn(data.text);

    return res.json({ title, isbn, rawText: data.text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Falha ao processar a imagem." });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

initializeWorker()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`OCR service rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar o worker Tesseract:", error);
    process.exit(1);
  });
