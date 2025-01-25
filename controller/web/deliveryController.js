const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const { ConflictError } = require("../../helper/errors");
const { postDeliverySchema } = require("../../schema/deliverySchema");

const updateDeliveryHistory = async (deliveryId, status) => {
  const id = uuidv4();
  await queryPromise(
    `INSERT INTO delivery_history (id,delivery_id, status, admin_id) VALUES (?, ?, ?,?)`,
    [id, deliveryId, status, "a229bb05-81ab-413d-8402-5d27d48794ab"]
  );
};

module.exports.postDelivery = async (req, res, next) => {
  const validatedBody = postDeliverySchema.parse(req.body);
  const { quote_id } = validatedBody;

  await queryPromise("START TRANSACTION");

  try {
    const existingDelivery = await queryPromise(
      "SELECT * FROM deliveries WHERE quote_id = ?",
      [quote_id]
    );

    if (existingDelivery.length > 0) {
      throw new ConflictError("Quote Id Already Exists");
    }

    const id = uuidv4();
    await queryPromise(
      `
              INSERT INTO deliveries (id,quote_id,status) VALUES (?, ?,?)
            `,
      [id, quote_id, "Delivery Created"]
    );
    await updateDeliveryHistory(id, "Delivery Created");

    await queryPromise("COMMIT");

    const data = await queryPromise(
      `
          SELECT * FROM deliveries
          WHERE quote_id = ?
        `,
      [quote_id]
    );
    const formattedData = await Promise.all(
      data?.map(async (plan) => {
        const history = await queryPromise(
          `
              SELECT * FROM delivery_history
              WHERE delivery_id = ?
              ORDER BY created_at ASC
            `,
          [plan.id]
        );

        return {
          ...plan,
          history: history,
        };
      })
    );
    res.status(201).json({
      message: "Delivery Created Successfully",
      success: true,
      data: formattedData[0],
    });
  } catch (error) {
    console.log(error);
    await queryPromise("ROLLBACK");
    next(error);
  }
};
