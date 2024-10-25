const { queryPromise } = require("../../helper/query");
const { BadRequestError } = require("../../helper/errors");
const { replyChatSchema } = require("../../schema/chatSchema");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
module.exports.getAllChats = async (req, res, next) => {
  try {
    let { page = 1, limit = 100000, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    let sqlSelect = `
      SELECT 
        chat.*, 
        COUNT(CASE WHEN chat_message.seen_by_admin = 0 THEN 1 END) AS unseen_count, 
        (SELECT message FROM chat_message WHERE chat_id = chat.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM chat_message WHERE chat_id = chat.id ORDER BY created_at DESC LIMIT 1) AS last_message_date
      FROM chat
      LEFT JOIN chat_message ON chat_message.chat_id = chat.id
    `;

    const conditions = [];
    let whereClause = "";

    if (startDate !== undefined && endDate !== undefined) {
      conditions.push(
        `chat.created_at BETWEEN '${startDate}' AND '${endDate}'`
      );
    } else if (startDate !== undefined) {
      conditions.push(`chat.created_at >= '${startDate}'`);
    }

    if (conditions.length > 0) {
      whereClause = ` WHERE ${conditions.join(" AND ")}`;
      sqlSelect += whereClause;
    }

    sqlSelect += `
      GROUP BY chat.id
      ORDER BY chat.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const data = await queryPromise(sqlSelect, [
      parseInt(limit),
      parseInt(offset),
    ]);

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM chat
      ${whereClause}
    `;

    const totalChats = await queryPromise(countQuery);
    const pageCount = Math.ceil(totalChats[0].total / limit);

    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: {
        items: data,
        pageCount: pageCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getChatDetails = async (req, res, next) => {
  try {
    const chatId = req.params.id;

    const sqlSelectChat = `
      SELECT * FROM chat
      WHERE id = ?
    `;
    const chat = await queryPromise(sqlSelectChat, [chatId]);

    if (chat.length === 0) {
      return next(new BadRequestError("Chat Not Found"));
    }

    const sqlSelectMessages = `
      SELECT * FROM chat_message
      WHERE chat_id = ? ORDER BY created_at DESC
    `;
    const messages = await queryPromise(sqlSelectMessages, [chatId]);

    await queryPromise(
      `
      UPDATE chat_message SET seen_by_admin = 1 WHERE chat_id = ? AND seen_by_admin = 0
    `,
      [chatId]
    );

    const formattedData = await Promise.all(
      messages?.map(async (msg) => {
        const imageLists = `
          SELECT * FROM chat_message_image
          WHERE chat_message_id = ?
        `;
        const images = await queryPromise(imageLists, [msg.id]);

        return {
          ...msg,
          images: images,
        };
      })
    );

    res.status(200).json({
      message: "Chat Details Fetched Successfully",
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.replyToChat = async (req, res, next) => {
  let uploadedFiles = [];
  try {
    const chatId = req.params.id;
    const adminId = req.admin.id;
    const validatedBody = replyChatSchema.parse(req.body);
    const files = req?.files["image"];
    uploadedFiles = files?.map((file) => file.filename);
    const chatCheck = await queryPromise("SELECT * FROM chat WHERE id = ?", [
      chatId,
    ]);
    if (chatCheck.length === 0) {
      return next(new BadRequestError("Chat Not Found"));
    }
    const messageId = uuidv4();

    const sqlInsertMessage = `
      INSERT INTO chat_message (id, chat_id, admin_id,  message, seen_by_user, seen_by_admin)
      VALUES (?, ?, ?, ?,0,1)
    `;
    await queryPromise(sqlInsertMessage, [
      messageId,
      chatId,
      adminId,
      validatedBody.message,
    ]);

    if (files && files.length > 0) {
      for (const fileName of uploadedFiles) {
        const imageId = uuidv4();
        const sqlInsertImage = `
          INSERT INTO chat_message_image (id, chat_id, chat_message_id, image)
          VALUES (?, ?, ?, ?)
        `;
        await queryPromise(sqlInsertImage, [
          imageId,
          chatId,
          messageId,
          fileName,
        ]);
      }
    }

    const sqlSelectMessages = `
    SELECT *
    FROM chat_message
    WHERE chat_id = ? AND id=?
  `;
    const data = await queryPromise(sqlSelectMessages, [chatId, messageId]);

    const formattedData = await Promise.all(
      data?.map(async (plan) => {
        const lists = `
        SELECT * FROM chat_message_image
        WHERE chat_message_id = ?
      `;
        const imageLists = await queryPromise(lists, [plan.id]);

        return {
          ...plan,
          images: imageLists,
        };
      })
    );

    res.status(201).json({
      message: "Reply Added Successfully",
      success: true,
      data: formattedData[0],
    });
  } catch (error) {
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const filePath of uploadedFiles) {
        try {
          await fs.unlink(`./uploads/chat/${filePath}`);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    }
    next(error);
  }
};

module.exports.deleteChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;

    const chatCheck = await queryPromise("SELECT * FROM chat WHERE id = ?", [
      chatId,
    ]);

    if (chatCheck.length === 0) {
      return next(new BadRequestError("Chat Not Found"));
    }

    const galleryImages = await queryPromise(
      "SELECT * FROM chat_message_image WHERE chat_id = ?",
      [chatId]
    );

    if (galleryImages.length > 0) {
      await Promise.all(
        galleryImages?.map(async (fileData) => {
          const filePath = `./uploads/chat/${fileData.image}`;
          try {
            await fs.unlink(filePath);
          } catch (error) {
            console.error("Error deleting file:", filePath, error);
          }
        })
      );

      await queryPromise("DELETE FROM chat_message_image WHERE chat_id = ?", [
        chatId,
      ]);
    }

    const sqlDeleteMessages = `
        DELETE FROM chat_message
        WHERE chat_id = ?
      `;
    await queryPromise(sqlDeleteMessages, [chatId]);

    const sqlDeleteChat = `
        DELETE FROM chat
        WHERE id = ?
      `;
    await queryPromise(sqlDeleteChat, [chatId]);

    res.status(200).json({
      message: "Chat and Associated Data Deleted Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
