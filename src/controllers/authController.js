import { getUserDetails, readEmails } from "../services/graphService.js";

export const authOutlook = async (req, res) => {
  const scopes = [
    "openid",
    "profile",
    "offline_access",
    "https://graph.microsoft.com/Mail.Read",
  ];

  try {
    const authUrl = await req.app.locals.msalClient.getAuthCodeUrl({
      scopes: scopes,
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    });

    res.redirect(authUrl);
  } catch (error) {
    console.log("Error creating auth URL:", error);
    res.status(500).send("Error initiating OAuth process");
  }
};

export const authOutlookCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code not provided");
  }

  const scopes = [
    "openid",
    "profile",
    "offline_access",
    "https://graph.microsoft.com/Mail.Read",
  ];

  const tokenRequest = {
    code,
    scopes: scopes,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  };

  try {
    const tokenResponse = await req.app.locals.msalClient.acquireTokenByCode(
      tokenRequest
    );
    req.session.userId = tokenResponse.account.homeAccountId;

    const user = await getUserDetails(
      req.app.locals.msalClient,
      req.session.userId
    );
    req.app.locals.users[req.session.userId] = {
      displayName: user.displayName,
      email: user.mail || user.userPrincipalName,
      timeZone: user.mailboxSettings.timeZone,
    };

    const esClient = req.app.locals.esClient;
    const indexExists = await esClient.indices.exists({ index: "users" });

    if (!indexExists) {
      await esClient.index({
        index: "users",
        body: {
          userAccountId: tokenResponse.account.homeAccountId,
          displayName: user.displayName,
          email: user.email || user.userPrincipalName,
        },
      });
    } else {
      const body = await esClient.search({
        index: "users",
        body: {
          query: {
            match: { email: user.userPrincipalName },
          },
        },
      });

      if (body && body.hits.total.value > 0) {
        const emails = await readEmails(
          req.app.locals.msalClient,
          req.session.userId
        );
        return res.status(200).send({ message: "MS OAuth successful", emails });
      }
    }

    const emails = await readEmails(
      req.app.locals.msalClient,
      req.session.userId
    );
    res.status(200).send({ message: "MS OAuth successful", emails });
  } catch (error) {
    console.error("Error completing authentication", JSON.stringify(error));
    res.status(500).send("Error during authentication");
  }
};
