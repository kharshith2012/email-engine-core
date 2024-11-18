import { fetchEmails, storeEmail } from "../services/emailService.js";

export const syncEmails = async (req, res) => {
  const esClient = req.app.locals.esClient;
  const accessToken = req.session.accessToken;
  const userId = req.session.userId;

  if (!accessToken || !userId) {
    console.error("Missing access token or user ID");
    return res.status(401).send("Not authenticated");
  }

  try {
    const emails = await fetchEmails(accessToken);

    for (const email of emails) {
      await storeEmail(esClient, userId, email);
    }

    res.send("Emails synchronized successfully");
  } catch (error) {
    console.error("Error syncing emails:", error);
    res.status(500).send("Error during email synchronization");
  }
};

export const streamEmailUpdates = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const intervalId = setInterval(() => {
    res.write(`data: ${JSON.stringify({ message: "Email update check" })}\n\n`);
  }, 5000);

  req.on("close", () => {
    clearInterval(intervalId);
  });
};
