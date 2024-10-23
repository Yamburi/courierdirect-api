const { queryPromise } = require("../../helper/query");
const { postQuerySchema } = require("../../schema/querySchema");
const { v4: uuidv4 } = require("uuid");
module.exports.postQuery = async (req, res, next) => {
  try {
    const validatedBody = postQuerySchema.parse(req.body);

    const id = uuidv4();

    const sqlInsert =
      "INSERT INTO query (id,name,phone, email,subject, message) VALUES (?, ?, ?, ?,?,?)";
    await queryPromise(sqlInsert, [
      id,
      validatedBody.name,
      validatedBody.phone,
      validatedBody.email,
      validatedBody.subject,
      validatedBody.message,
    ]);

    const insertedData = await queryPromise(
      "SELECT * FROM query WHERE id = ?",
      [id]
    );
    res.status(201).json({
      message: "Data Added Successfully",
      success: true,
      data: insertedData[0],
    });
  } catch (error) {
    next(error);
  }
};
