import express from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const algorithm = "aes-256-ctr";
const secretKey = crypto.createHash("sha256")
  .update(process.env.ENCRYPTION_SECRET)
  .digest("base64")
  .substring(0, 32);

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

// Save LinkedIn account
router.post("/", async (req, res) => {
  try {
    const { email, password, proxy } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await supabase
      .from("linkedin_accounts")
      .insert([
        {
          email: encrypt(email),
          password: encrypt(password),
          proxy: proxy ? encrypt(proxy) : null,
        },
      ])
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
