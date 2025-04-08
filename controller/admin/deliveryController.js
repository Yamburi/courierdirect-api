const { v4: uuidv4 } = require("uuid");

const { queryPromise } = require("../../helper/query");
const {
  NotFoundError,
  AuthorizationError,
  ConflictError,
  BadRequestError,
} = require("../../helper/errors");
const {
  postDeliverySchema,
  editDeliverySchema,
} = require("../../schema/deliverySchema");
const omitPassword = (admin) => {
  const { password, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
module.exports.getDelivery = async (req, res, next) => {
  try {
    let {
      startDate,
      endDate,
      status,
      search,
      page = 1,
      pageSize = 10,
    } = req.query;
    const offset = (page - 1) * pageSize;
    let sqlSelect = `SELECT * FROM deliveries`;
    const conditions = [];
    let whereClause = "";
    if (startDate !== undefined && endDate !== undefined) {
      conditions.push(`created_at BETWEEN '${startDate}' AND '${endDate}'`);
    } else if (startDate !== undefined) {
      conditions.push(`created_at >= '${startDate}'`);
    }
    if (status !== undefined) {
      conditions.push(`status = '${status}'`);
    }
    if (search !== undefined) {
      conditions.push(`quote_id LIKE '%${search}%'`);
    }
    if (conditions.length > 0) {
      whereClause = ` WHERE ${conditions.join(" AND ")}`;
      sqlSelect += whereClause;
    }

    sqlSelect += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const data = await queryPromise(sqlSelect, [
      parseInt(pageSize),
      parseInt(offset),
    ]);

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

        const updatedHistory = await Promise.all(
          history?.map(async (his) => {
            const admin = await queryPromise(
              `
                SELECT * FROM admin
                WHERE id = ? 
              `,
              [his.admin_id]
            );

            return {
              ...his,
              admin: omitPassword(admin[0]),
            };
          })
        );

        return {
          ...plan,
          history: updatedHistory,
        };
      })
    );

    let sqlCount = `SELECT COUNT(*) as totalCount FROM deliveries`;
    if (conditions.length > 0) {
      sqlCount += ` WHERE ${conditions.join(" AND ")}`;
    }
    const totalCountResult = await queryPromise(sqlCount);
    const totalCount = totalCountResult[0].totalCount;
    const pageCount = Math.ceil(totalCount / pageSize);
    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: { items: formattedData, pageCount: pageCount },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.getDeliveryByRole = async (req, res, next) => {
  try {
    let { startDate, endDate, search, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let roleCondition = "";
    if (req.admin.role === "Scanner") {
      roleCondition = `EXISTS (SELECT 1 FROM delivery_history WHERE delivery_id = deliveries.id AND status = 'Order Dispatched')`;
    } else if (req.admin.role === "Employee") {
      roleCondition = `EXISTS (SELECT 1 FROM delivery_history WHERE delivery_id = deliveries.id AND status = 'Out For Delivery')`;
    } else if (req.admin.role === "Driver") {
      roleCondition = `EXISTS (SELECT 1 FROM delivery_history WHERE delivery_id = deliveries.id AND status = 'Delivered')`;
    }

    const conditions = [];
    if (startDate !== undefined && endDate !== undefined) {
      conditions.push(`created_at BETWEEN '${startDate}' AND '${endDate}'`);
    } else if (startDate !== undefined) {
      conditions.push(`created_at >= '${startDate}'`);
    }
    if (search !== undefined) {
      conditions.push(`quote_id LIKE '%${search}%'`);
    }
    if (roleCondition) {
      conditions.push(roleCondition);
    }

    let whereClause = "";
    if (conditions.length > 0) {
      whereClause = ` WHERE ${conditions.join(" AND ")}`;
    }

    const sqlSelect = `
      SELECT * FROM deliveries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const data = await queryPromise(sqlSelect, [
      parseInt(pageSize),
      parseInt(offset),
    ]);

    // Fetch and format history for each delivery
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

        const updatedHistory = await Promise.all(
          history?.map(async (his) => {
            const admin = await queryPromise(
              `
                SELECT * FROM admin
                WHERE id = ?
              `,
              [his.admin_id]
            );

            return {
              ...his,
              admin: omitPassword(admin[0]),
            };
          })
        );

        return {
          ...plan,
          history: updatedHistory,
        };
      })
    );

    // Get total count for pagination
    let sqlCount = `SELECT COUNT(*) as totalCount FROM deliveries ${whereClause}`;
    const totalCountResult = await queryPromise(sqlCount);
    const totalCount = totalCountResult[0].totalCount;
    const pageCount = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: { items: formattedData, pageCount: pageCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getDeliveryHistoryByQuoteId = async (req, res, next) => {
  try {
    const { quoteId } = req.params;

    if (!quoteId) {
      throw new BadRequestError("Quote Id is required.");
    }

    const delivery = await queryPromise(
      `
        SELECT * FROM deliveries
        WHERE quote_id = ?
      `,
      [quoteId]
    );

    if (delivery.length === 0) {
      throw new NotFoundError("Delivery Not Found");
    }

    const deliveryId = delivery[0].id;

    const history = await queryPromise(
      `
        SELECT * FROM delivery_history
        WHERE delivery_id = ?
        ORDER BY created_at ASC
      `,
      [deliveryId]
    );

    const formattedHistory = await Promise.all(
      history?.map(async (his) => {
        const admin = await queryPromise(
          `
            SELECT * FROM admin
            WHERE id = ?
          `,
          [his.admin_id]
        );

        return {
          ...his,
          admin: admin.length > 0 ? omitPassword(admin[0]) : null,
        };
      })
    );

    res.status(200).json({
      message: "Delivery history fetched successfully.",
      success: true,
      data: {
        delivery: delivery[0],
        history: formattedHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDeliveryHistory = async (deliveryId, status, adminId) => {
  const id = uuidv4();
  await queryPromise(
    `INSERT INTO delivery_history (id,delivery_id, status, admin_id) VALUES (?, ?, ?,?)`,
    [id, deliveryId, status, adminId]
  );
};

const updateDeliveryStatus = async (quoteId, status) => {
  await queryPromise(`UPDATE deliveries SET status = ? WHERE quote_id = ?`, [
    status,
    quoteId,
  ]);
};

module.exports.postDelivery = async (req, res, next) => {
  const validatedBody = postDeliverySchema.parse(req.body);
  const { quote_id } = validatedBody;

  const adminRole = req.admin.role;
  const adminId = req.admin.id;

  await queryPromise("START TRANSACTION");

  try {
    const existingDelivery = await queryPromise(
      "SELECT * FROM deliveries WHERE quote_id = ?",
      [quote_id]
    );

    if (existingDelivery.length <= 0) {
      throw new NotFoundError("Quote Id Not Found");
    }

    const deliveryId = existingDelivery[0].id;
    const currentStatus = existingDelivery[0].status;

    if (adminRole === "Scanner") {
      if (currentStatus === "Delivery Created") {
        await updateDeliveryHistory(deliveryId, "Order Dispatched", adminId);
        await updateDeliveryStatus(quote_id, "Order Dispatched");
      } else {
        throw new BadRequestError(
          "Cannot update to 'Order Dispatched'. Current status is not 'Delivery Created'."
        );
      }
    }

    if (adminRole === "Employee") {
      if (currentStatus === "Order Dispatched") {
        await updateDeliveryHistory(deliveryId, "Out For Delivery", adminId);
        await updateDeliveryStatus(quote_id, "Out For Delivery");
      } else {
        throw new BadRequestError(
          "Cannot update to 'Out For Delivery'. Current status is not 'Order Dispatched'."
        );
      }
    }

    if (adminRole === "Driver") {
      if (currentStatus === "Out For Delivery") {
        await updateDeliveryHistory(deliveryId, "Delivered", adminId);
        await updateDeliveryStatus(quote_id, "Delivered");
      } else {
        throw new BadRequestError(
          "Cannot update to 'Delivered'. Current status is not 'Out For Delivery'."
        );
      }
    }

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

        const updatedHistory = await Promise.all(
          history?.map(async (his) => {
            const admin = await queryPromise(
              `
                SELECT * FROM admin
                WHERE id = ?
              `,
              [his.admin_id]
            );

            return {
              ...his,
              admin: omitPassword(admin[0]),
            };
          })
        );

        return {
          ...plan,
          history: updatedHistory,
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

module.exports.editDelivery = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Only Admin can edit."));
    }

    const id = req.params.id;
    const adminId = req.admin.id;
    const { status } = editDeliverySchema.parse(req.body);

    const existingData = await queryPromise(
      "SELECT * FROM deliveries WHERE id = ?",
      [id]
    );
    if (existingData.length === 0)
      throw new NotFoundError("Delivery Not Found");

    const currentStatus = existingData[0].status;

    const statusFlow = {
      "Delivery Created": ["Order Dispatched"],
      "Order Dispatched": ["Out For Delivery", "Delivery Created"],
      "Out For Delivery": ["Delivered", "Order Dispatched", "Delivery Created"],
      Delivered: ["Out For Delivery", "Order Dispatched", "Delivery Created"],
    };

    if (!statusFlow[currentStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid Delivery Status Update. Current status is ${currentStatus}, cannot update to ${status}.`,
        success: false,
      });
    }

    const deleteHistory = async (statusToDelete) => {
      await queryPromise(
        "DELETE FROM delivery_history WHERE delivery_id = ? AND status = ?",
        [id, statusToDelete]
      );
    };

    // Update status logic
    if (currentStatus === "Delivery Created" && status === "Order Dispatched") {
      await updateDeliveryHistory(id, "Order Dispatched", adminId);
      await updateDeliveryStatus(existingData[0].quote_id, "Order Dispatched");
    } else if (
      currentStatus === "Order Dispatched" &&
      status === "Out For Delivery"
    ) {
      await updateDeliveryHistory(id, "Out For Delivery", adminId);
      await updateDeliveryStatus(existingData[0].quote_id, "Out For Delivery");
    } else if (
      currentStatus === "Order Dispatched" &&
      status === "Delivery Created"
    ) {
      await deleteHistory("Order Dispatched");
      await updateDeliveryStatus(existingData[0].quote_id, "Delivery Created");
    } else if (currentStatus === "Out For Delivery" && status === "Delivered") {
      await updateDeliveryHistory(id, "Delivered", adminId);
      await updateDeliveryStatus(existingData[0].quote_id, "Delivered");
    } else if (
      currentStatus === "Out For Delivery" &&
      status === "Order Dispatched"
    ) {
      await deleteHistory("Out For Delivery");
      await updateDeliveryStatus(existingData[0].quote_id, "Order Dispatched");
    } else if (currentStatus === "Delivered" && status === "Out For Delivery") {
      await deleteHistory("Delivered");
      await updateDeliveryStatus(existingData[0].quote_id, "Out For Delivery");
    } else if (currentStatus === "Delivered" && status === "Order Dispatched") {
      await deleteHistory("Out For Delivery");
      await deleteHistory("Delivered");
      await updateDeliveryStatus(existingData[0].quote_id, "Order Dispatched");
    }

    const data = await queryPromise(`SELECT * FROM deliveries WHERE id = ?`, [
      id,
    ]);
    const formattedData = await Promise.all(
      data?.map(async (plan) => {
        const history = await queryPromise(
          `SELECT * FROM delivery_history WHERE delivery_id = ? ORDER BY created_at ASC`,
          [plan.id]
        );

        const updatedHistory = await Promise.all(
          history?.map(async (his) => {
            const admin = await queryPromise(
              `SELECT * FROM admin WHERE id = ?`,
              [his.admin_id]
            );

            return {
              ...his,
              admin: omitPassword(admin[0]),
            };
          })
        );

        return {
          ...plan,
          history: updatedHistory,
        };
      })
    );

    res.status(200).json({
      message: "Delivery status updated successfully",
      success: true,
      data: formattedData[0],
    });
  } catch (error) {
    next(error);
  }
};
module.exports.deleteDelivery = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM deliveries WHERE id = ?",
      [id]
    );
    if (existingData.length === 0)
      throw new NotFoundError("Delivery Not Found");

    await queryPromise("DELETE FROM delivery_history WHERE delivery_id = ?", [
      id,
    ]);

    await queryPromise("DELETE FROM deliveries WHERE id = ?", [id]);

    res.status(200).json({
      message: "Delivery and associated history deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.cancelDelivery = async (req, res, next) => {
  try {
    if (req.admin.role !== "Admin") {
      return next(new AuthorizationError("Forbidden: Only Admin can cancel."));
    }

    const id = req.params.id;

    const existingData = await queryPromise(
      "SELECT * FROM deliveries WHERE id = ?",
      [id]
    );
    if (existingData.length === 0)
      throw new NotFoundError("Delivery Not Found");

    const currentStatus = existingData[0].status;

    if (currentStatus !== "Delivery Created") {
      return res.status(400).json({
        message: `Cannot Cancel Scanned Delivery`,
        success: false,
      });
    }
    await queryPromise("DELETE FROM delivery_history WHERE delivery_id = ?", [
      id,
    ]);
    await updateDeliveryHistory(id, "Cancelled", req.admin.id);
    await updateDeliveryStatus(existingData[0]?.quote_id, "Cancelled");

    const data = await queryPromise(
      `
        SELECT * FROM deliveries
        WHERE id = ?
      `,
      [id]
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

        const updatedHistory = await Promise.all(
          history?.map(async (his) => {
            const admin = await queryPromise(
              `
                SELECT * FROM admin
                WHERE id = ?
              `,
              [his.admin_id]
            );

            return {
              ...his,
              admin: omitPassword(admin[0]),
            };
          })
        );

        return {
          ...plan,
          history: updatedHistory,
        };
      })
    );

    res.status(200).json({
      message: "Delivery status updated successfully",
      success: true,
      data: formattedData[0],
    });
  } catch (error) {
    next(error);
  }
};
