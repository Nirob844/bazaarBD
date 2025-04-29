import nodemailer from 'nodemailer';
import config from '../../../config';
import prisma from '../../../shared/prisma';

export const sendEmailNotification = async ({
  userId,
  toEmail,
  subject,
  body,
  type,
  templateId,
}: {
  userId: string;
  toEmail: string;
  subject: string;
  body: string;
  type:
    | 'ORDER_CONFIRMATION'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'ACCOUNT_CONFIRMATION'; // etc.
  templateId?: string;
}) => {
  // 1. Log email as pending
  const notification = await prisma.emailNotification.create({
    data: {
      userId,
      toEmail,
      subject,
      body,
      type,
      templateId,
      status: 'PENDING',
    },
  });

  try {
    // 2. Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or Mailgun, SendGrid, etc.
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    await transporter.sendMail({
      from: 'nirobhossainalip@gmail.com',
      to: toEmail,
      subject,
      html: body,
    });

    // 3. Update status to SENT
    await prisma.emailNotification.update({
      where: { id: notification.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  } catch (error) {
    // 4. Update status to FAILED if sending fails
    await prisma.emailNotification.update({
      where: { id: notification.id },
      data: {
        status: 'FAILED',
        error: (error as Error).message,
      },
    });
  }
};
