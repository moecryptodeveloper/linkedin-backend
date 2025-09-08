import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import linkedinAccountsRouter from "./routes/linkedinAccounts.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/linkedin-accounts", linkedinAccountsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
