import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const esClient = req.app.locals.esClient;
  const { username, password } = req.body;
  const hashedPassword = await hash(password, 10);

  try {
    const indexExists = await esClient.indices.exists({ index: "users" });

    if (!indexExists) {
      const response = await esClient.index({
        index: "users",
        body: {
          username,
          password: hashedPassword,
          userAccountId: "",
          displayName: "",
          email: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        refresh: true,
      });

      const token = jwt.sign(
        { username, localId: response._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(201).send({ message: "User created successfully", token });
    } else {
      const body = await esClient.search({
        index: "users",
        body: {
          query: {
            match: { username },
          },
        },
      });

      if (body && body.hits.total.value > 0) {
        res.status(409).send({ message: `${username} already exists!` });
      }
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ error: "Error creating user" });
  }
};

export const login = async (req, res) => {
  const esClient = req.app.locals.esClient;
  const { username, password } = req.body;

  try {
    const body = await esClient.search({
      index: "users",
      body: {
        query: {
          match: { username },
        },
      },
    });

    if (body.hits.total.value === 0) {
      return res.status(400).send({ error: "Invalid username or password" });
    }

    const user = body.hits.hits[0]._source;
    const match = await compare(password, user.password);

    if (!match) {
      return res.status(400).send({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { username, localId: body.hits.hits[0]._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;
    res.status(200).send({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send({ error: "Error logging in user" });
  }
};

// export const fetchUserDetails = async (req, res) => {
//   const { userId } = req.params; // Assuming userId is passed as a route parameter
//   try {
//     const user = await getUserDetails(req.app.locals.msalClient, userId);
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const fetchEmails = async (req, res) => {
//   const { userId } = req.params; // Assuming userId is passed as a route parameter
//   try {
//     const messages = await readEmails(req.app.locals.msalClient, userId);
//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
