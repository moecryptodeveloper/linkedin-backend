import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// ✅ Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================================
// GET all LinkedIn accounts
// ================================
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("linkedin_accounts")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// ================================
// POST - Add new LinkedIn account
// ================================
router.post("/", async (req, res) => {
  const { userId, accountName, cookie, proxyId } = req.body;

  if (!userId || !accountName || !cookie) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("linkedin_accounts")
    .insert([
      {
        user_id: userId,
        account_name: accountName,
        cookie,
        proxy_id: proxyId || null,
        status: "active"
      }
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
});

// ================================
// DELETE - Remove LinkedIn account
// ================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("linkedin_accounts")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, id });
});

export default router;
