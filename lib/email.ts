import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(to: string, name: string, code: string) {
  await transporter.sendMail({
    from: `"Kzen's Puto Bumbong" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Verify your email — Kzen's Puto Bumbong",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f5fa; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1fa2; margin: 0;">🎋 Kzen's Puto Bumbong</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 32px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Hi, ${name}! 👋</h2>
          <p style="color: #6b7280;">Please verify your email address to complete your registration.</p>
          <p style="color: #6b7280;">Your verification code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 8px; color: #7b1fa2; background: #f3e5f5; padding: 16px 32px; border-radius: 12px; display: inline-block;">
              ${code}
            </span>
          </div>
          <p style="color: #9ca3af; font-size: 0.85rem;">This code expires in <strong>10 minutes</strong>. Do not share this with anyone.</p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 0.8rem; margin-top: 20px;">
          © 2025 Kzen's Puto Bumbong · Cebu City, Philippines
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(to: string, name: string, orderId: string, total: number) {
  await transporter.sendMail({
    from: `"Kzen's Puto Bumbong" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Order Confirmed #${orderId.slice(-8).toUpperCase()} — Kzen's Puto Bumbong`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f5fa; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1fa2; margin: 0;">🎋 Kzen's Puto Bumbong</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 32px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Order Confirmed! 🎉</h2>
          <p style="color: #6b7280;">Hi <strong>${name}</strong>, your order has been received!</p>
          <div style="background: #f3e5f5; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #7b1fa2; font-weight: 700;">Order #${orderId.slice(-8).toUpperCase()}</p>
            <p style="margin: 8px 0 0; color: #1a1a2e; font-size: 1.2rem; font-weight: 800;">Total: ₱${total}</p>
          </div>
          <p style="color: #6b7280;">We'll prepare your puto bumbong fresh. You can track your order status anytime.</p>
          <p style="color: #9ca3af; font-size: 0.85rem;">Salamat sa imong order! 🙏</p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 0.8rem; margin-top: 20px;">
          © 2025 Kzen's Puto Bumbong · Cebu City, Philippines
        </p>
      </div>
    `,
  });
}

const STATUS_CONFIG: Record<string, { emoji: string; color: string; title: string; message: string }> = {
  Preparing: {
    emoji: "👨‍🍳",
    color: "#3b82f6",
    title: "We're Preparing Your Order!",
    message: "Great news! Our team has started preparing your fresh puto bumbong. It won't be long!",
  },
  Ready: {
    emoji: "✅",
    color: "#8b5cf6",
    title: "Your Order is Ready!",
    message: "Your puto bumbong is ready! We'll be delivering it to you shortly. Please prepare your payment.",
  },
  Completed: {
    emoji: "🎉",
    color: "#10b981",
    title: "Order Completed!",
    message: "Your order has been delivered. We hope you enjoyed your puto bumbong! Salamat sa imong suporta!",
  },
  Cancelled: {
    emoji: "❌",
    color: "#ef4444",
    title: "Order Cancelled",
    message: "We're sorry, but your order has been cancelled. Please contact us if you have any questions.",
  },
};

export async function sendOrderStatusEmail(
  to: string,
  name: string,
  orderId: string,
  status: string,
  total: number
) {
  const config = STATUS_CONFIG[status];
  if (!config) return; // Only send for specific statuses

  await transporter.sendMail({
    from: `"Kzen's Puto Bumbong" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${config.emoji} Order #${orderId.slice(-8).toUpperCase()} — ${config.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f5fa; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7b1fa2; margin: 0;">🎋 Kzen's Puto Bumbong</h1>
        </div>
        <div style="background: white; border-radius: 12px; padding: 32px;">
          <div style="text-align: center; font-size: 3rem; margin-bottom: 16px;">${config.emoji}</div>
          <h2 style="color: #1a1a2e; margin-top: 0; text-align: center;">${config.title}</h2>
          <p style="color: #6b7280;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6b7280;">${config.message}</p>
          <div style="background: #f3e5f5; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #9ca3af; font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</p>
            <p style="margin: 8px 0 0; color: #7b1fa2; font-weight: 700; font-size: 1rem;">Order #${orderId.slice(-8).toUpperCase()}</p>
            <p style="margin: 4px 0 0; color: #1a1a2e; font-weight: 800; font-size: 1.1rem;">Total: ₱${total}</p>
          </div>
          <div style="text-align: center; margin-top: 8px;">
            <span style="display: inline-block; padding: 6px 20px; border-radius: 999px; background: ${config.color}22; color: ${config.color}; font-weight: 700; font-size: 0.9rem; border: 1.5px solid ${config.color}44;">
              Status: ${status}
            </span>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 0.8rem; margin-top: 20px;">
          © 2025 Kzen's Puto Bumbong · Cebu City, Philippines
        </p>
      </div>
    `,
  });
}
