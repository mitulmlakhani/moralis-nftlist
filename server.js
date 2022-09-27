const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const whitelist = (process.env.WHITELISTED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      throw new Error("invalid origin");
    }
  },
};

app.use(cors(corsOptions));

app.get("/nfts", (req, res) => {
  const options = {
    headers: {
      Accept: "application/json",
      "X-API-Key": process.env.MORALIS_KEY,
    },
  };

  const address = req.query.address;
  const chain = req.query.chain;
  const cursor = req.query.cursor;

  if (!address || !chain) {
    res.status(422).send("Require params are missing");
    return;
  }

  axios
    .get(
      `https://deep-index.moralis.io/api/v2/${address}/nft?chain=${chain}&format=decimal&limit=100&cursor=${cursor}`,
      options
    )
    .then((response) => {
      res.status(200).send({
        total: response?.data?.total || 0,
        cursor: response?.data?.cursor ? response.data.cursor : "",
        nfts: response?.data?.result || [],
      });
    })
    .catch((err) =>
      res
        .status(500)
        .send(err?.response?.data?.message || "Internal Server Error")
    );
});

app.listen(4000);
