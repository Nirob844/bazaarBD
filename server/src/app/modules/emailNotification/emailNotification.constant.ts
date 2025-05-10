/* eslint-disable no-unused-vars */
export enum EmailType {
  WELCOME_EMAIL = 'WELCOME_EMAIL',
  ACCOUNT_CONFIRMATION = 'ACCOUNT_CONFIRMATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export type TemplateData = {
  [EmailType.WELCOME_EMAIL]: { name: string };
  [EmailType.ACCOUNT_CONFIRMATION]: { code: string };
  [EmailType.PASSWORD_RESET]: { resetLink: string };
  [EmailType.ORDER_CONFIRMATION]: {
    orderNumber: string;
    orderDate: string;
    totalAmount: string;
  };
  [EmailType.PAYMENT_SUCCESS]: {
    orderNumber: string;
    amount: string;
    paymentMethod: string;
  };
  [EmailType.PAYMENT_FAILED]: {
    orderNumber: string;
    amount: string;
    reason: string;
  };
  [EmailType.ORDER_SHIPPED]: {
    orderNumber: string;
    trackingNumber: string;
    estimatedDelivery: string;
  };
  [EmailType.ORDER_DELIVERED]: {
    orderNumber: string;
    deliveryDate: string;
  };
  [EmailType.ACCOUNT_LOCKED]: {
    name: string;
    unlockTime: string;
  };
  [EmailType.SECURITY_ALERT]: {
    name: string;
    loginTime: string;
    location: string;
    device: string;
  };
};

export type EmailTemplate<T extends EmailType> = {
  subject: string;
  template: (data: TemplateData[T]) => {
    subject: string;
    body: string;
  };
};

type EmailTemplates = {
  [K in EmailType]: EmailTemplate<K>;
};

export const EMAIL_TEMPLATES: EmailTemplates = {
  [EmailType.WELCOME_EMAIL]: {
    subject: 'Welcome to BazaarBD - Your Account is Ready!',
    template: data => ({
      subject: 'Welcome to BazaarBD - Your Account is Ready!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to BazaarBD, ${data.name}!</h2>
          <p>Thank you for joining our community. We're excited to have you on board!</p>
          <p>Your account has been successfully created and is ready to use.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Getting Started:</h3>
            <ul>
              <li>Complete your profile</li>
              <li>Browse our products</li>
              <li>Start shopping!</li>
            </ul>
          </div>
          <p>If you have any questions, our support team is here to help.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.ACCOUNT_CONFIRMATION]: {
    subject: 'Verify Your BazaarBD Account',
    template: data => ({
      subject: 'Verify Your BazaarBD Account',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Verify Your Email Address</h2>
          <p>Thank you for registering with BazaarBD. To complete your registration, please use the following verification code:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 2px;">${data.code}</strong>
          </div>
          <p><strong>Important:</strong> This code will expire in 15 minutes.</p>
          <p>If you did not create this account, please ignore this email or contact our support team.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.PASSWORD_RESET]: {
    subject: 'Reset Your BazaarBD Password',
    template: data => ({
      subject: 'Reset Your BazaarBD Password',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
          <p><strong>Note:</strong> This link will expire in 1 hour.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.ORDER_CONFIRMATION]: {
    subject: 'Order Confirmation - BazaarBD',
    template: data => ({
      subject: 'Order Confirmation - BazaarBD',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Thank you for your order! We're pleased to confirm that we've received your order.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Order Details:</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${data.orderDate}</p>
            <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
          </div>
          <p>We'll notify you when your order ships.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.PAYMENT_SUCCESS]: {
    subject: 'Payment Successful - BazaarBD',
    template: data => ({
      subject: 'Payment Successful - BazaarBD',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Payment Successful</h2>
          <p>Your payment has been processed successfully.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Payment Details:</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Amount:</strong> ${data.amount}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>
          <p>Thank you for shopping with BazaarBD!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.PAYMENT_FAILED]: {
    subject: 'Payment Failed - BazaarBD',
    template: data => ({
      subject: 'Payment Failed - BazaarBD',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Payment Failed</h2>
          <p>We were unable to process your payment.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Details:</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Amount:</strong> ${data.amount}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
          </div>
          <p>Please try again or contact our support team for assistance.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.ORDER_SHIPPED]: {
    subject: 'Your Order Has Been Shipped - BazaarBD',
    template: data => ({
      subject: 'Your Order Has Been Shipped - BazaarBD',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Your Order Has Been Shipped!</h2>
          <p>Great news! Your order is on its way.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Shipping Details:</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>
          <p>You can track your order using the tracking number above.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.ORDER_DELIVERED]: {
    subject: 'Order Delivered - BazaarBD',
    template: data => ({
      subject: 'Order Delivered - BazaarBD',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Order Delivered</h2>
          <p>Your order has been successfully delivered!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444;">Delivery Details:</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
          </div>
          <p>Thank you for shopping with BazaarBD!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.ACCOUNT_LOCKED]: {
    subject: 'Your BazaarBD Account Has Been Locked',
    template: data => ({
      subject: 'Your BazaarBD Account Has Been Locked',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Account Locked</h2>
          <p>Dear ${data.name},</p>
          <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
          <p>For security reasons, you will be able to try logging in again after ${data.unlockTime}.</p>
          <p>If you need immediate assistance, please contact our support team.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
  [EmailType.SECURITY_ALERT]: {
    subject: 'Security Alert - Suspicious Login Attempt',
    template: data => ({
      subject: 'Security Alert - Suspicious Login Attempt',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Security Alert</h2>
          <p>Dear ${data.name},</p>
          <p>We detected a login attempt to your account from an unrecognized device:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Time:</strong> ${data.loginTime}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Device:</strong> ${data.device}</p>
          </div>
          <p>If this was you, you can ignore this email. If not, please secure your account immediately.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    }),
  },
} as const;

export const EMAIL_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
  VERIFICATION_CODE_EXPIRY: 15 * 60 * 1000, // 15 minutes in milliseconds
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;
