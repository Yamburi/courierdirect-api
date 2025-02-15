const { queryPromise } = require("../../helper/query");
const { BadRequestError } = require("../../helper/errors");
const { replyChatSchema } = require("../../schema/chatSchema");
const { v4: uuidv4 } = require("uuid");
const { deleteFile } = require("../../helper/unsync");
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

    await queryPromise(`UPDATE chat_message SET fetch_by_admin = 1`);

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

module.exports.getNewAllChats = async (req, res, next) => {
  const pollInterval = 5000;
  const maxPollAttempts = 10;
  let attempts = 0;

  try {
    const pollForNewChats = async () => {
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
        AND chat_message.seen_by_admin = 0
        AND chat_message.fetch_by_admin = 0
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

      const unseenChats = data.filter((chat) => chat.unseen_count > 0);

      await queryPromise(`UPDATE chat_message SET fetch_by_admin = 1`);

      if (unseenChats.length > 0) {
        const unseenChatIds = unseenChats.map((chat) => chat.id);
        const updateQuery = `
        UPDATE chat_message 
        SET fetch_by_admin = 1 
        WHERE chat_id IN (?)
      `;

        await queryPromise(updateQuery, [unseenChatIds]);
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
            items: unseenChats,
            pageCount: pageCount,
          },
        });
      } else if (attempts < maxPollAttempts) {
        attempts++;
        setTimeout(pollForNewChats, pollInterval);
      } else {
        res.status(204).json({
          success: true,
          message: "No new unseen chats",
          data: [],
        });
      }
    };

    await pollForNewChats();
  } catch (error) {
    next(error);
  }
};

module.exports.getChatById = async (req, res, next) => {
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

    res.status(200).json({
      message: "Chat Details Fetched Successfully",
      success: true,
      data: chat[0],
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
      UPDATE chat_message SET seen_by_admin = 1, fetch_by_admin = 1 WHERE chat_id = ? AND seen_by_admin = 0
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

module.exports.getNewMessages = async (req, res, next) => {
  const chatId = req.params.id;
  const pollInterval = 5000;
  const maxPollAttempts = 10;
  let attempts = 0;

  try {
    const pollForNewMessages = async () => {
      const sqlSelectNewMessages = `
        SELECT * FROM chat_message
        WHERE chat_id = ? AND seen_by_admin = 0 
        ORDER BY created_at DESC
      `;
      const newMessages = await queryPromise(sqlSelectNewMessages, [chatId]);
      await queryPromise(
        `
        UPDATE chat_message SET seen_by_admin = 1, fetch_by_admin = 1 WHERE chat_id = ? AND seen_by_admin = 0
      `,
        [chatId]
      );
      if (newMessages.length > 0) {
        const formattedMessages = await Promise.all(
          newMessages.map(async (msg) => {
            const imageQuery = `SELECT * FROM chat_message_image WHERE chat_message_id = ?`;
            const images = await queryPromise(imageQuery, [msg.id]);
            return { ...msg, images };
          })
        );

        res.status(200).json({
          success: true,
          message: "New messages found",
          data: formattedMessages,
        });
      } else if (attempts < maxPollAttempts) {
        attempts++;
        setTimeout(pollForNewMessages, pollInterval);
      } else {
        res
          .status(204)
          .json({ success: true, message: "No new messages", data: [] });
      }
    };

    await pollForNewMessages();
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
      INSERT INTO chat_message (id, chat_id, admin_id,  message, seen_by_user, seen_by_admin, fetch_by_user, fetch_by_admin)
      VALUES (?, ?, ?, ?,0,1,0,1)
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
        deleteFile(`./uploads/chat/${filePath}`);
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

          deleteFile(filePath);
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

module.exports.getUnseenCount = async (req, res, next) => {
  try {
    const sqlUnseenCount = `
      SELECT COUNT(DISTINCT chat_id) AS count
      FROM chat_message
      WHERE seen_by_admin = 0
    `;

    const result = await queryPromise(sqlUnseenCount);
    const count = result[0].count;

    res.status(200).json({
      message: "Unseen chat count fetched successfully",
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getNewUnseenCount = async (req, res, next) => {
  const pollInterval = 5000;
  const maxPollAttempts = 10;
  let attempts = 0;

  try {
    const pollForNewUnseenCount = async () => {
      const sqlUnseenCount = `
      SELECT COUNT(DISTINCT chat_id) AS count
      FROM chat_message
      WHERE seen_by_admin = 0 AND fetch_by_admin=0
    `;

      const result = await queryPromise(sqlUnseenCount);
      const count = result[0].count;
      if (count > 0) {
        res.status(200).json({
          message: "Unseen chat count fetched successfully",
          success: true,
          data: { count },
        });
      } else if (attempts < maxPollAttempts) {
        attempts++;
        setTimeout(pollForNewUnseenCount, pollInterval);
      } else {
        res
          .status(204)
          .json({ success: true, message: "No new messages", data: [] });
      }
    };

    await pollForNewUnseenCount();
  } catch (error) {
    next(error);
  }
};
