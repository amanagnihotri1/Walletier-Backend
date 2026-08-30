require("dotenv").config();
const { createClient } = require("redis");
const { Worker, Queue, createNodeRedisClient } = require("bullmq");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generatePasswordResetHtml = (name, resetURL) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2b3a4a; margin-top: 0;">Password Reset Request</h2>
      <p>Hello <b>${name || "User"}</b>,</p>
      <p>You recently requested to reset your password for your <b>Walletier</b> account. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in <b>1 hour</b>.</p>
      <p style="color: #666; font-size: 14px;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
      <p style="word-break: break-all; color: #2563eb; font-size: 13px;"><a href="${resetURL}">${resetURL}</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
      <p style="color: #888; font-size: 12px; margin-bottom: 0;">If you did not request this password reset, please ignore this email or contact support if you have questions. Your password will remain unchanged.</p>
    </div>
  `;
};

let email_Queue = null;
let email_worker = null;

try {
  const rawClient = createClient({
    url: process.env.REDIS_SERVER,
  });

  rawClient.on("error", (err) => {
    console.warn("Redis client warning:", err.message);
  });

  const connection = createNodeRedisClient(rawClient);
  email_Queue = new Queue("email_queue", { connection });
  email_Queue.on("error", (err) => {
    console.warn("BullMQ queue warning:", err.message);
  });

  email_worker = new Worker(
    "email_queue",
    async (job) => {
      const { email, user, resetURL, name } = job.data;
      const recipientEmail = email || user?.email;
      const recipientName = name || user?.fullName || "User";

      if (!recipientEmail || !resetURL) {
        throw new Error("Missing recipient email or reset URL in job data");
      }

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || "walletier_no_reply@gmail.com",
        to: recipientEmail,
        subject: "Password Reset Request - Walletier",
        html: generatePasswordResetHtml(recipientName, resetURL),
      });

      console.log("Email sent successfully: %s", info.messageId);
      return info;
    },
    { connection }
  );

  email_worker.on("completed", (job) => {
    console.log(`Email job completed successfully with ID: ${job.id}`);
  });

  email_worker.on("failed", (job, error) => {
    console.error(`Email job failed with ID: ${job?.id}. Error: ${error.message}`);
  });

  email_worker.on("error", (err) => {
    console.warn("BullMQ worker warning:", err.message);
  })
}catch (error) {
  console.warn("BullMQ initialization warning:", error.message);
}

const sendPasswordResetEmail = async ({ email, name, resetURL }) => {
  if (email_Queue) {
    try {
      const job = await email_Queue.add(
        "password_reset",
        { email, name, resetURL },
        {
          attempts: 3,
          removeOnComplete: { age: 300, count: 100 },
          removeOnFail: { age: 3600, count: 100 },
        }
      );
      return { queued: true, jobId: job.id };
    } catch (queueErr) {
      console.warn("Queueing email failed, attempting direct delivery:", queueErr.message);
    }
  }

  // Direct send fallback
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || "walletier_no_reply@gmail.com",
    to: email,
    subject: "Password Reset Request - Walletier",
    html: generatePasswordResetHtml(name, resetURL),
  });

  return { queued: false, messageId: info.messageId };
};

module.exports = {email_Queue,sendPasswordResetEmail,generatePasswordResetHtml};