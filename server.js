import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Diagnosis endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { userQuery, systemPrompt } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: "Missing userQuery" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt || "" },
        { role: "user", content: userQuery },
      ],
    });

    const text = completion.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({
      error: "Failed to connect to OpenAI",
      details: err.message,
    });
  }
});

// Fallback: send index.html for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
