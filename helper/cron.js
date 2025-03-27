const cron = require("node-cron");
const { queryPromise } = require("./query");
const sendEmail = require("./mail");

cron.schedule("*/30 * * * *", async () => {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const users = await queryPromise(
      `
      SELECT DISTINCT c.email, c.name, cm.user_id
      FROM chat_message cm
      JOIN chat c ON cm.chat_id = c.id
      WHERE cm.seen_by_user = 0
      AND cm.created_at <= ?
      AND cm.email_sent = 0
    `,
      [oneHourAgo]
    );

    for (const user of users) {
      const { email, name, user_id } = user;

      if (email) {
        const subject = "Unseen Message Notification";
        const body = `
          <p>Dear ${name || "User"},</p>
          <p>You have unread messages in your chat.</p>
          <p>Please log in to your chat to check your messages.</p>
          <p>Best Regards,<br/>Courier Direct Team</p>
        `;

        await sendEmail(email, subject, body);

        await queryPromise(
          `UPDATE chat_message 
           SET email_sent = 1 
           WHERE user_id = ? 
           AND seen_by_user = 0 
           AND created_at <= ?`,
          [user_id, oneHourAgo]
        );
      }
    }
  } catch (error) {
    console.error("Error running the unseen message cron job:", error);
  }
});
