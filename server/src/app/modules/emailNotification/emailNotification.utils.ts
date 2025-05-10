import { EmailStatus } from '@prisma/client';
import nodemailer from 'nodemailer';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import { logger } from '../../../utils/logger';
import {
  EMAIL_TEMPLATES,
  EmailType,
  TemplateData,
} from './emailNotification.constant';

type EmailNotificationParams = {
  userId: string;
  toEmail: string;
  subject: string;
  body: string;
  type: EmailType;
  templateId?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
};

export const sendEmailNotification = async ({
  userId,
  toEmail,
  subject,
  body,
  type,
  templateId,
  attachments,
}: EmailNotificationParams) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail)) {
    throw new Error('Invalid email address format');
  }

  // 1. Log email as pending
  const notification = await prisma.emailNotification.create({
    data: {
      userId,
      toEmail,
      subject,
      body,
      type,
      templateId,
      status: EmailStatus.PENDING,
    },
  });

  try {
    // 2. Configure email transporter
    const transporter = nodemailer.createTransport({
      service: config.email.service || 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: false, // Only for development
      },
    });

    // 3. Send email
    const mailOptions = {
      from: `"BazaarBD" <${config.email.user}>`,
      to: toEmail,
      subject,
      html: body,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully: ${info.messageId}`);

    // 4. Update status to SENT
    await prisma.emailNotification.update({
      where: { id: notification.id },
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
        messageId: info.messageId,
      },
    });

    return info;
  } catch (error) {
    logger.error('Failed to send email:', error);

    // 5. Update status to FAILED
    await prisma.emailNotification.update({
      where: { id: notification.id },
      data: {
        status: EmailStatus.FAILED,
        error: (error as Error).message,
        retryCount: {
          increment: 1,
        },
      },
    });

    throw error;
  }
};

// Helper function to send template-based emails
export const sendTemplateEmail = async <T extends EmailType>(
  type: T,
  params: {
    userId: string;
    toEmail: string;
    templateData: TemplateData[keyof TemplateData];
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
    }>;
  }
) => {
  const template = EMAIL_TEMPLATES[
    type
  ] as import('./emailNotification.constant').EmailTemplate<T>;
  if (!template) {
    throw new Error(`Email template not found for type: ${type}`);
  }

  const { subject, body } = template.template(
    params.templateData as TemplateData[T]
  );
  return sendEmailNotification({
    userId: params.userId,
    toEmail: params.toEmail,
    subject,
    body,
    type,
    attachments: params.attachments,
  });
};
