const { v4: uuidv4 } = require("uuid");
const { queryPromise } = require("../../helper/query");
const { BadRequestError } = require("../../helper/errors");
const { postChatSchema, replyChatSchema } = require("../../schema/chatSchema");
const { generateUniqueOrderId } = require("../../helper/helpers");
const fs = require("fs").promises;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
module.exports.createChat = async (req, res, next) => {
  try {
    const validatedBody = postChatSchema.parse(req.body);
    const chatId = generateUniqueOrderId();

    // Insert chat details for the user
    const sqlInsertChat = `
      INSERT INTO chat (id, user_id, name, phone, email)
      VALUES (?, ?, ?, ?, ?)
    `;
    await queryPromise(sqlInsertChat, [
      chatId,
      validatedBody.user_id,
      validatedBody.name,
      validatedBody.phone,
      validatedBody.email,
    ]);

    // Insert user's initial message
    const messageId = uuidv4();
    const sqlInsertMessage = `
      INSERT INTO chat_message (id, chat_id, user_id, message, seen_by_user, seen_by_admin)
      VALUES (?, ?, ?, ?, 1, 0)
    `;
    await queryPromise(sqlInsertMessage, [
      messageId,
      chatId,
      validatedBody.user_id,
      validatedBody.message,
    ]);
    await delay(1000);
    // Only proceed with the admin reply once the user's message has been successfully inserted
    const admin = await queryPromise(`SELECT * FROM admin`);
    const adminReplyId = uuidv4();
    const adminReplyMessage =
      "Thank you for reaching out. We will get back to you shortly.";

    const sqlInsertAdminReply = `
      INSERT INTO chat_message (id, chat_id, admin_id, message, seen_by_user, seen_by_admin)
      VALUES (?, ?, ?, ?, 1, 0)
    `;
    await queryPromise(sqlInsertAdminReply, [
      adminReplyId,
      chatId,
      admin[0].id,
      adminReplyMessage,
    ]);

    // Fetch all messages including the admin reply for the response
    const sqlSelectMessages = `
      SELECT *
      FROM chat_message
      WHERE chat_id = ? ORDER BY created_at DESC
    `;
    const data = await queryPromise(sqlSelectMessages, [chatId]);

    // Format data by adding image list to each message
    const formattedData = await Promise.all(
      data?.map(async (message) => {
        const imageQuery = `
          SELECT * FROM chat_message_image
          WHERE chat_message_id = ?
        `;
        const imageLists = await queryPromise(imageQuery, [message.id]);
        return { ...message, images: imageLists };
      })
    );

    // Respond with all chat data, including admin reply
    res.status(201).json({
      message: "Chat Created Successfully",
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
    const validatedBody = replyChatSchema.parse(req.body);
    const userId = req.params.userId;
    const chatId = req.params.id;
    const files = req?.files["image"];
    uploadedFiles = files?.map((file) => file.filename);

    const chatCheck = await queryPromise(
      "SELECT * FROM chat WHERE id = ? AND user_id = ?",
      [chatId, userId]
    );
    if (chatCheck.length === 0) {
      return res.status(200).json({
        message: "Chat Details Fetched Successfully",
        success: true,
        data: [],
      });
    }
    const messageId = uuidv4();
    const sqlInsertMessage = `
      INSERT INTO chat_message (id,chat_id, user_id,  message, seen_by_user, seen_by_admin)
      VALUES (?, ?, ?, ?,1,0)
    `;
    await queryPromise(sqlInsertMessage, [
      messageId,
      chatId,
      userId,
      validatedBody.message,
    ]);

    if (files && files?.length > 0 && Array.isArray(files)) {
      const fileNames = files.map((file) => file.filename);

      for (const fileName of fileNames) {
        const imageId = uuidv4();
        const sqlInsertImage = `
          INSERT INTO chat_message_image (id,chat_id, chat_message_id, image)
          VALUES (?, ?,?,?)
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
    if (uploadedFiles && uploadedFiles?.length > 0) {
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

module.exports.getChatDetails = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const chatCheck = await queryPromise(
      "SELECT * FROM chat WHERE user_id = ?",
      [userId]
    );
    if (chatCheck.length === 0) {
      return res.status(200).json({
        message: "Chat Details Fetched Successfully",
        success: true,
        data: [],
      });
    }
    const chatId = chatCheck[0].id;
    const sqlSelectMessages = `
        SELECT *
        FROM chat_message
        WHERE chat_id = ? ORDER BY created_at DESC
      `;
    const data = await queryPromise(sqlSelectMessages, [chatId]);

    await queryPromise(
      `
      UPDATE chat_message SET seen_by_user = 1 WHERE chat_id = ? AND seen_by_user = 0
    `,
      [chatId]
    );

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
  const userId = req.params.id;

  const chatCheck = await queryPromise("SELECT * FROM chat WHERE user_id = ?", [
    userId,
  ]);
  if (chatCheck.length === 0) {
    return res.status(200).json({
      message: "Chat Details Fetched Successfully",
      success: true,
      data: [],
    });
  }
  const chatId = chatCheck[0].id;
  const pollInterval = 5000;
  const maxPollAttempts = 10;
  let attempts = 0;

  try {
    const pollForNewMessages = async () => {
      const sqlSelectNewMessages = `
        SELECT * FROM chat_message
        WHERE chat_id = ? AND seen_by_user = 0
        ORDER BY created_at DESC
      `;
      const newMessages = await queryPromise(sqlSelectNewMessages, [chatId]);
      await queryPromise(
        `
        UPDATE chat_message SET seen_by_user = 1 WHERE chat_id = ? AND seen_by_user = 0
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

module.exports.getUnseenCount = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const chatCheck = await queryPromise(
      "SELECT * FROM chat WHERE user_id = ?",
      [userId]
    );
    if (chatCheck.length === 0) {
      return res.status(200).json({
        message: "Chat Details Fetched Successfully",
        success: true,
        data: [],
      });
    }
    const chatId = chatCheck[0].id;

    const sqlSelectMessages = `SELECT COUNT(*) AS unseen_count FROM chat_message WHERE chat_id = ? AND seen_by_user = 0`;
    const data = await queryPromise(sqlSelectMessages, [chatId]);

    res.status(200).json({
      message: "Data Fetched Successfully",
      success: true,
      data: {
        count: data[0].unseen_count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
