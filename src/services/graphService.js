import { Client } from "@microsoft/microsoft-graph-client";

function getAuthenticatedClient(msalClient, userId) {
  if (!msalClient || !userId) {
    throw new Error(
      `Invalid MSAL state. Client: ${
        msalClient ? "present" : "missing"
      }, User ID: ${userId ? "present" : "missing"}`
    );
  }

  // Initialize Graph client
  const client = Client.init({
    authProvider: async (done) => {
      try {
        // Retrieve the user's account from the MSAL cache
        const account = await msalClient
          .getTokenCache()
          .getAccountByHomeId(userId);

        if (account) {
          console.log("Account found:", account);

          // Attempt to get the token silently
          const scopes = ["User.Read", "Mail.Read", "Calendars.Read"];

          const response = await msalClient.acquireTokenSilent({
            scopes: scopes,
            redirectUri: process.env.OAUTH_REDIRECT_URI,
            account: account,
          });
          done(null, response.accessToken);
        } else {
          console.log("No account found for userId:", userId);
          done(new Error("Account not found in cache"), null);
        }
      } catch (err) {
        if (err.name === "InteractionRequiredAuthError") {
          console.log("Silent token acquisition failed, interaction required.");
          // Handle re-authentication here if applicable
          done(new Error("Interaction required for authentication"), null);
        } else {
          console.log(
            "Error acquiring token:",
            JSON.stringify(err, Object.getOwnPropertyNames(err))
          );
          done(err, null);
        }
      }
    },
  });

  return client;
}

async function getUserDetails(msalClient, userId) {
  const client = getAuthenticatedClient(msalClient, userId);
  const user = await client
    .api("/me")
    .select("displayName,mail,mailboxSettings,userPrincipalName")
    .get();
  return user;
}

async function readEmails(msalClient, userId) {
  const client = getAuthenticatedClient(msalClient, userId);
  const messages = await client
    .api("/me/mailFolders/inbox/messages")
    .select("subject, from")
    .top(10)
    .get();
  return messages;
}

export { getUserDetails, readEmails };
