import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import linkedinAccountsRouter from "./src/routes/linkedinAccounts.js";

dotenv.config();
const app = express();

// Enable CORS for frontend requests
app.use(cors({ origin: "*" }));

app.use(express.json());

// Routes
app.use("/api/linkedin-accounts", linkedinAccountsRouter);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
