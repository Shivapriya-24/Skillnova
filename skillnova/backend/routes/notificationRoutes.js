const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/:userId", notificationController.list);

router.post("/read/:id", notificationController.markRead);

router.post("/unread/:id", notificationController.markUnread);

router.post("/mark-all-read/:userId", notificationController.markAllRead);

router.delete("/:id", notificationController.remove);

module.exports = router;
