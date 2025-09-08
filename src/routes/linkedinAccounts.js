import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Create new LinkedIn account
router.post("/", async (req, res) => {
  try {
    const { accountName, cookie, proxyId } = req.body;

    if (!accountName || !cookie) {
      return res.status(400).json({ error: "Account name and cookie are required" });
    }

    // Build insert payload
    let payload = {
      account_name: accountName,
      cookie,
    };

    // Only include proxy_id if it's valid
    if (proxyId && proxyId.trim() !== "") {
      payload.proxy_id = proxyId;
    }

    const { data, error } = await supabase
      .from("linkedin_accounts")
      .insert([payload])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error("Error adding LinkedIn account:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all accounts
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("linkedin_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching LinkedIn accounts:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete account
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("linkedin_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, id });
  } catch (err) {
    console.error("Error deleting LinkedIn account:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
