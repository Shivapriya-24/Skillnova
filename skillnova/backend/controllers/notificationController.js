const Notification = require("../models/Notification");
const { io } = require("../server");

exports.createNotification = async ({ userId, type, title, message, data }) => {
  try {
    if (!userId || !title || !message) throw new Error("Missing fields");

    const notif = new Notification({
      userId,          
      type: type || "system",
      title,
      message,
      read: false,
      data: data || {},
      createdAt: new Date(),
    });
    await notif.save();

    io?.to(userId)?.emit("notification:new", notif);

    return notif;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

exports.list = async (req, res) => {
  try {
    const email = req.params.userId;
    if (!email) return res.status(400).json({ error: "userId/email required" });

    const notifications = await Notification.find({ userId: email, type:'session' })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ notifications });
  } catch (err) {
    console.error("fetch notifications error", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markRead = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "id required" });

    const notif = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    io?.to(notif.userId)?.emit("notification:update", notif);
    res.json({ ok: true });
  } catch (err) {
    console.error("markRead error", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markUnread = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "id required" });

    const notif = await Notification.findByIdAndUpdate(id, { read: false }, { new: true });
    io?.to(notif.userId)?.emit("notification:update", notif);
    res.json({ ok: true });
  } catch (err) {
    console.error("markUnread error", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const email = req.params.userId;
    if (!email) return res.status(400).json({ error: "userId/email required" });

    await Notification.updateMany({ userId: email }, { read: true });

    const notifications = await Notification.find({ userId: email }).sort({ createdAt: -1 });
    notifications.forEach((n) => io?.to(email)?.emit("notification:update", n));

    res.json({ ok: true });
  } catch (err) {
    console.error("markAllRead error", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "id required" });

    const notif = await Notification.findByIdAndDelete(id);
    io?.to(notif.userId)?.emit("notification:update", notif);

    res.json({ ok: true });
  } catch (err) {
    console.error("remove notification error", err);
    res.status(500).json({ error: "Server error" });
  }
};
