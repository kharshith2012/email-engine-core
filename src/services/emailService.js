import axios from "axios";

export async function fetchEmails(accessToken) {
  const url = "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages";
  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    const response = await axios.get(url, { headers });
    return response.data.value; // Return emails array
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw new Error("Failed to fetch emails");
  }
}

export async function storeEmail(esClient, userId, email) {
  try {
    await esClient.index({
      index: "email_messages",
      body: {
        userId,
        subject: email.subject,
        sender: email.from.emailAddress.address,
        timestamp: email.receivedDateTime,
        content: email.body.content,
      },
    });
  } catch (error) {
    console.error("Error storing email:", error);
    throw new Error("Failed to store email");
  }
}
