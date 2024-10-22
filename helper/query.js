const db = require("../db");

const queryPromise = async (sql, params) => {
  try {
    const [data] = await db.promise().query(sql, params);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { queryPromise };
