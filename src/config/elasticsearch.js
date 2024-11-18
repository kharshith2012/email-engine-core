import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

client.ping({}, (error) => {
  if (error) {
    console.log("##ERROR##:", error);
  } else {
    console.log("Connected to elastic search");
  }
});

async function createIndices() {
  const indices = [
    {
      index: "email_messages",
      body: {
        mappings: {
          properties: {
            userId: { type: "keyword" },
            subject: { type: "text" },
            sender: { type: "text" },
          },
        },
      },
    },
    {
      index: "mailbox_details",
      body: {
        mappings: {
          properties: {
            userId: { type: "keyword" },
            mailboxName: { type: "text" },
            syncToken: { type: "text" },
          },
        },
      },
    },
  ];

  try {
    for (const index of indices) {
      const exists = await client.indices.exists({ index: index.index });
      if (!exists.body) {
        const indexResult = await client.indices.create({
          index: index.index,
          body: index.body,
        });
        console.log(`${index.index} result: ${indexResult}`);
      } else {
        console.log(`${index.index} already exists`);
      }
    }
  } catch (error) {
    console.log(
      "Error creating indicies: ",
      error.meta.body.error.root_cause[0].type
    );
  }
}

createIndices();

export { client, createIndices };
