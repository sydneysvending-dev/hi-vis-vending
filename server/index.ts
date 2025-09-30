// server/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug: log the DATABASE_URL and SENDGRID_API_KEY
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY);

// Simple health check route
app.get("/", (_req, res) => {
  res.send("Server is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

