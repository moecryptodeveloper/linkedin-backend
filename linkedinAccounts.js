import express from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const router = express.Router();

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Encryption config
const ALGO = "aes-256-gcm";
const ENC_KEY = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET).digest();
const IV_LENGTH = 16;

// Encrypt cookie
function encryptCookie(cookie) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(cookie, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  });
}

// Decrypt cookie (only for automation workers, not frontend)
function decryptCookie(encrypted) {
  const { iv, content, tag } = JSON.parse(encrypted);
  const decipher = crypto.createDecipheriv(ALGO, ENC_KEY, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(content, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * 2.2.1 Add LinkedIn account
 */
router.post("/", async (req, res) => {
  const { userId, accountName, cookie, proxyId } = req.body;
  if (!cookie) return res.status(400).json({ error: "Cookie is required" });

  const encryptedCookie = encryptCookie(cookie);

  const { data, error } = await supabase.from("linkedin_accounts").insert([
    {
      user_id: userId,
      account_name: accountName,
      credentials_encrypted: encryptedCookie,
      proxy_id: proxyId,
      status: "warming_up",
    },
  ]);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, account: data });
});

/**
 * 2.2.2 Get all accounts for a user
 */
router.get("/", async (req, res) => {
  const { userId } = req.query;

  const { data, error } = await supabase
    .from("linkedin_accounts")
    .select("id, account_name, status, proxy_id, created_at, updated_at")
    .eq("user_id", userId)
    .eq("is_deleted", false);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

/**
 * 2.2.3 Update account (status or proxy)
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, proxyId } = req.body;

  const { data, error } = await supabase
    .from("linkedin_accounts")
    .update({ status, proxy_id: proxyId, updated_at: new Date() })
    .eq("id", id);

  if (error) return res.status(400).json({ error });
  res.json({ success: true, account: data });
});

/**
 * 2.2.4 Soft delete account
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("linkedin_accounts")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) return res.status(400).json({ error });
  res.json({ success: true });
});

export default router;
