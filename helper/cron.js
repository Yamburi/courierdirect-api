// const cron = require("node-cron");
// const { queryPromise } = require("./query");
// const sendEmail = require("./mail");
// const { addYears } = require("./helpers");
// const { subDays } = require("date-fns");
// const { format } = require("express/lib/response");

// cron.schedule("0 0 * * *", async () => {
//   try {
//     const installations = await queryPromise(`
//         SELECT id, installation_no, hospital_name, warranty_start_date,
//         hospital_full_warranty, hospital_service_warranty, warranty_status
//         FROM installation
//         WHERE warranty_status != 'Expired'
//       `);

//     const currentDate = new Date();

//     for (const installation of installations) {
//       try {
//         const {
//           id,
//           installation_no,
//           hospital_name,
//           warranty_start_date,
//           hospital_full_warranty,
//           hospital_service_warranty,
//         } = installation;

//         const expiryDate = addYears(
//           new Date(warranty_start_date),
//           hospital_full_warranty + hospital_service_warranty
//         );

//         if (currentDate >= expiryDate) {
//           await queryPromise(
//             "UPDATE installation SET warranty_status = 'Expired' WHERE id = ?",
//             [id]
//           );
//           const users = await queryPromise(
//             `SELECT email FROM user WHERE role="Admin"`
//           );

//           for (const user of users) {
//             await sendEmail(
//               user.email,
//               `Warranty Expired for Installation: ${installation_no}`,
//               `
//                 <p>Dear Admin,</p>

//                 <p>The warranty for the following installation has expired:</p>

//                 <ul>
//                   <li><strong>Installation Number:</strong> ${installation_no}</li>
//                   <li><strong>Hospital Name:</strong> ${hospital_name}</li>
//                   <li><strong>Expiry Date:</strong> ${expiryDate.toDateString()}</li>
//                 </ul>

//                 <p>Please take the necessary actions.</p>

//                 <p>Best regards,<br/>Himalayan Medical Technologies Team</p>
//                 `
//             );
//           }
//         }
//       } catch (err) {
//         console.error(
//           `Error processing installation ${installation.installation_no}:`,
//           err
//         );
//       }
//     }
//   } catch (error) {
//     console.error("Error running the warranty expiry cron job:", error);
//   }
// });

// cron.schedule("0 0 * * *", async () => {
//   try {
//     const currentDate = new Date();
//     const reminderDate = subDays(currentDate, 3);

//     const preventiveMaintenances = await queryPromise(`
//       SELECT pm.id, pm.pm_no, pm.date, i.hospital_name, i.department as installation_department, u.email, u.department as user_department
//       FROM preventive_maintenance pm
//       LEFT JOIN installation i ON pm.installation_id = i.id
//       LEFT JOIN user u ON u.department = i.department
//       WHERE pm.date = '${format(reminderDate, "yyyy-MM-dd")}'
//       AND i.department = u.department
//     `);

//     for (const maintenance of preventiveMaintenances) {
//       const { pm_no, date, hospital_name, email } = maintenance;

//       await sendEmail(
//         email,
//         `Upcoming Preventive Maintenance: ${pm_no}`,
//         `
//           <p>Dear Team Members,</p>
//           <p>This is a reminder that preventive maintenance is scheduled for the following installation:</p>
//           <ul>
//             <li><strong>Preventive Maintenance Number:</strong> ${pm_no}</li>
//             <li><strong>Hospital Name:</strong> ${hospital_name}</li>
//             <li><strong>Scheduled Date:</strong> ${date}</li>
//           </ul>
//           <p>Please be prepared.</p>
//           <p>Best regards,<br/>Himalayan Medical Technologies Team</p>
//         `
//       );
//     }
//   } catch (error) {
//     console.error(
//       "Error running the preventive maintenance reminder cron job:",
//       error
//     );
//   }
// });
