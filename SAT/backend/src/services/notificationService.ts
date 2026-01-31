import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize Twilio Client
// In a real app, these would be in .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// const client = twilio(accountSid, authToken);

// Initialize Email Transporter
// Using a mock or Ethereal for dev, or real SMTP for prod
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'test_user',
        pass: process.env.SMTP_PASS || 'test_pass',
    },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        if (!to) return;

        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);

        // Uncomment to actually send if credentials are present
        /*
        const info = await transporter.sendMail({
          from: '"MediCast System" <alerts@medicast.com>',
          to,
          subject,
          text,
        });
        console.log('Message sent: %s', info.messageId);
        */
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendSMS = async (to: string, body: string) => {
    try {
        if (!to) return;

        console.log(`[MOCK SMS] To: ${to} | Body: ${body}`);

        // Uncomment to actually send if credentials are present
        /*
        if (accountSid && authToken) {
            const client = twilio(accountSid, authToken);
            const message = await client.messages.create({
            body,
            from: twilioPhoneNumber,
            to,
            });
            console.log('SMS sent: %s', message.sid);
        }
        */
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

export const sendWhatsApp = async (to: string, body: string) => {
    try {
        if (!to) return;

        console.log(`[MOCK WHATSAPP] To: ${to} | Body: ${body}`);

        // Twilio WhatsApp usually requires 'whatsapp:' prefix
        /*
        if (accountSid && authToken) {
            const client = twilio(accountSid, authToken);
            const message = await client.messages.create({
            body,
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${to}`,
            });
            console.log('WhatsApp sent: %s', message.sid);
        }
        */
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
    }
};
