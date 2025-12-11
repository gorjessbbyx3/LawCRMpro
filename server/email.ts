import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string = '';
  private fromName: string = 'LegalCRM Pro';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = process.env.GODADDY_EMAIL_USER;
    const emailPass = process.env.GODADDY_EMAIL_PASSWORD;
    const emailHost = process.env.GODADDY_EMAIL_HOST || 'smtpout.secureserver.net';
    const emailPort = parseInt(process.env.GODADDY_EMAIL_PORT || '465');

    if (!emailUser || !emailPass) {
      console.log('Email service not configured. Set GODADDY_EMAIL_USER and GODADDY_EMAIL_PASSWORD environment variables.');
      return;
    }

    this.fromEmail = emailUser;

    const config: EmailConfig = {
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    };

    this.transporter = nodemailer.createTransport(config);

    this.transporter.verify((error: Error | null, success: boolean) => {
      if (error) {
        console.error('Email transporter verification failed:', error.message);
      } else {
        console.log('Email service connected and ready');
      }
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: options.from || `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('Failed to send email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPortalInvitation(
    email: string,
    firstName: string,
    invitationToken: string,
    attorneyName: string
  ): Promise<{ success: boolean; error?: string }> {
    const baseUrl = process.env.APP_URL || 'https://your-app.replit.app';
    const invitationLink = `${baseUrl}/portal/accept-invitation?token=${invitationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Your Client Portal</h1>
          </div>
          <div class="content">
            <p>Dear ${firstName},</p>
            <p>${attorneyName} has invited you to access your client portal for LegalCRM Pro.</p>
            <p>Through this portal, you can:</p>
            <ul>
              <li>View your case information and status updates</li>
              <li>Access invoices and billing details</li>
              <li>See upcoming appointments and court dates</li>
              <li>Communicate securely with your legal team</li>
            </ul>
            <p>Click the button below to set up your account:</p>
            <p style="text-align: center;">
              <a href="${invitationLink}" class="button">Set Up Your Account</a>
            </p>
            <p><strong>This invitation expires in 7 days.</strong></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${invitationLink}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LegalCRM Pro.</p>
            <p>If you did not expect this invitation, please disregard this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Dear ${firstName},

${attorneyName} has invited you to access your client portal for LegalCRM Pro.

Through this portal, you can:
- View your case information and status updates
- Access invoices and billing details
- See upcoming appointments and court dates
- Communicate securely with your legal team

Click the link below to set up your account:
${invitationLink}

This invitation expires in 7 days.

If you did not expect this invitation, please disregard this email.
    `;

    return this.sendEmail({
      to: email,
      subject: 'You\'re Invited to Your Client Portal - LegalCRM Pro',
      text,
      html
    });
  }

  async sendInvoiceEmail(
    email: string,
    clientName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .invoice-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .amount { font-size: 24px; color: #2563eb; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invoice Notification</h1>
          </div>
          <div class="content">
            <p>Dear ${clientName},</p>
            <p>A new invoice has been generated for your account.</p>
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> <span class="amount">$${amount.toFixed(2)}</span></p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            <p>Please log in to your client portal to view the full invoice details and payment options.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LegalCRM Pro.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Dear ${clientName},

A new invoice has been generated for your account.

Invoice Number: ${invoiceNumber}
Amount Due: $${amount.toFixed(2)}
Due Date: ${dueDate}

Please log in to your client portal to view the full invoice details and payment options.
    `;

    return this.sendEmail({
      to: email,
      subject: `Invoice ${invoiceNumber} - LegalCRM Pro`,
      text,
      html
    });
  }

  async sendEventReminder(
    email: string,
    recipientName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventType: string,
    location?: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .event-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            <p>This is a reminder about your upcoming ${eventType}:</p>
            <div class="event-details">
              <p><strong>${eventTitle}</strong></p>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Time:</strong> ${eventTime}</p>
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            <p>Please ensure you are prepared and arrive on time.</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from LegalCRM Pro.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Dear ${recipientName},

This is a reminder about your upcoming ${eventType}:

${eventTitle}
Date: ${eventDate}
Time: ${eventTime}
${location ? `Location: ${location}` : ''}

Please ensure you are prepared and arrive on time.
    `;

    return this.sendEmail({
      to: email,
      subject: `Reminder: ${eventTitle} - ${eventDate}`,
      text,
      html
    });
  }

  async sendMessageNotification(
    email: string,
    recipientName: string,
    senderName: string,
    messagePreview: string,
    caseName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Message</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            <p>You have received a new message from ${senderName}${caseName ? ` regarding ${caseName}` : ''}:</p>
            <div class="message-box">
              <p>${messagePreview}</p>
            </div>
            <p>Log in to your portal to view the full message and respond.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from LegalCRM Pro.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Dear ${recipientName},

You have received a new message from ${senderName}${caseName ? ` regarding ${caseName}` : ''}:

"${messagePreview}"

Log in to your portal to view the full message and respond.
    `;

    return this.sendEmail({
      to: email,
      subject: `New Message from ${senderName} - LegalCRM Pro`,
      text,
      html
    });
  }
}

export const emailService = new EmailService();
