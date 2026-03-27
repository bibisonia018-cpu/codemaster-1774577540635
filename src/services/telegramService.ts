export const sendOrderToTelegram = async (vendor: any, order: any, customer: any) => {
  const { telegramBotToken, telegramChatId, shopName } = vendor;
  
  if (!telegramBotToken || !telegramChatId) {
    console.error("Vendor has not configured Telegram settings.");
    return;
  }

  const message = `
🔔 *طلب جديد من متجر: ${shopName}*
--------------------------
📦 *المنتج:* ${order.productName}
💰 *السعر:* ${order.price} د.ج

👤 *معلومات الزبون:*
- الإسم: ${customer.name}
- الهاتف: ${customer.phone}
- العنوان: ${customer.address}

📍 *حالة الطلب:* بانتظار التجهيز
  `;

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
};