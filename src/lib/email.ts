import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function sendOrderStatusEmail(to: string, status: string, orderId: string, fileName: string) {
  let subject = `Order Update: ${fileName}`;
  let html = `<p>Your 3D print order <strong>${fileName}</strong> is now <strong>${status}</strong>.</p><p>Order ID: ${orderId}</p>`;

  if (status === 'PAID') {
    subject = `Order Confirmation: ${fileName}`;
    html = `
      <h2>Thank you for your order!</h2>
      <p>We have received your payment and your order for <strong>${fileName}</strong> will begin processing.</p>
      <p>Order ID: ${orderId}</p>
    `;
  } else if (status === 'PRINTING') {
    subject = `Your order is printing: ${fileName}`;
    html = `
      <h2>We're printing your model!</h2>
      <p>Your order for <strong>${fileName}</strong> is currently on the printer.</p>
      <p>Order ID: ${orderId}</p>
    `;
  } else if (status === 'SHIPPED') {
    subject = `Order Shipped: ${fileName}`;
    html = `
      <h2>Great news!</h2>
      <p>Your order for <strong>${fileName}</strong> has been shipped!</p>
      <p>Order ID: ${orderId}</p>
    `;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Orders <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });
    
    if (error) {
      console.error('Resend Error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
    return null;
  }
}

export async function sendQuoteGeneratedEmail(to: string, fileName: string, totalCost: number, quoteId: string) {
  const subject = `New Quote Generated: ${fileName}`;
  const html = `
    <h2>New Quote Request Alert</h2>
    <p>A user just generated a quote on the platform.</p>
    <ul>
      <li><strong>File:</strong> ${fileName}</li>
      <li><strong>Cost:</strong> $${totalCost.toFixed(2)}</li>
      <li><strong>Quote ID:</strong> ${quoteId}</li>
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard">View Dashboard</a></p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Orders <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });
    
    if (error) {
      console.error('Resend Error (Quote Notification):', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to send quote generated email:', err);
    return null;
  }
}
