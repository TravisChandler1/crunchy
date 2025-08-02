// SMS notification service using Twilio or Termii (popular in Nigeria)

// Option 1: Using Twilio
import twilio from 'twilio';

// Option 2: Using Termii (Nigerian SMS service)
// import axios from 'axios';

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Termii configuration
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'CrunchyCruise';

export interface SMSMessage {
  to: string;
  message: string;
}

// Send SMS using Twilio
export const sendSMSViaTwilio = async ({ to, message }: SMSMessage) => {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log('SMS sent via Twilio:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return { success: false, error: error };
  }
};

// Send SMS using Termii (Nigerian service)
export const sendSMSViaTermii = async ({ to, message }: SMSMessage) => {
  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        from: TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        api_key: TERMII_API_KEY,
        channel: 'generic'
      })
    });

    const result = await response.json();
    
    if (result.message_id) {
      console.log('SMS sent via Termii:', result.message_id);
      return { success: true, messageId: result.message_id };
    } else {
      console.error('Termii SMS error:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('Termii SMS error:', error);
    return { success: false, error: error };
  }
};

// Main SMS sending function (choose your preferred service)
export const sendSMS = async ({ to, message }: SMSMessage) => {
  // Use Termii for Nigerian numbers, Twilio for international
  if (to.startsWith('+234') || to.startsWith('234') || to.startsWith('0')) {
    return await sendSMSViaTermii({ to, message });
  } else {
    return await sendSMSViaTwilio({ to, message });
  }
};

// Pre-defined SMS templates
export const smsTemplates = {
  orderConfirmation: (orderRef: string, total: number) => 
    `Hi! Your Crunchy Cruise order ${orderRef} has been confirmed. Total: ₦${total.toLocaleString()}. We'll notify you when it's ready for delivery. Thank you!`,
    
  orderReady: (orderRef: string) => 
    `Great news! Your Crunchy Cruise order ${orderRef} is ready for delivery. Our delivery team will be with you shortly. Get ready to crunch and cruise! 🚚`,
    
  orderOutForDelivery: (orderRef: string, estimatedTime: string) => 
    `Your Crunchy Cruise order ${orderRef} is on the way! Estimated delivery: ${estimatedTime}. Track your order at ${process.env.NEXT_PUBLIC_BASE_URL}/track`,
    
  orderDelivered: (orderRef: string) => 
    `Your Crunchy Cruise order ${orderRef} has been delivered! Enjoy your delicious plantain chips. Please rate your experience at ${process.env.NEXT_PUBLIC_BASE_URL}/feedback`,
    
  orderCancelled: (orderRef: string, reason?: string) => 
    `We're sorry, but your Crunchy Cruise order ${orderRef} has been cancelled${reason ? `: ${reason}` : ''}. If you have any questions, please contact us.`,
    
  paymentReceived: (orderRef: string, amount: number) => 
    `Payment confirmed! ₦${amount.toLocaleString()} received for order ${orderRef}. Your delicious plantain chips are being prepared. Thank you for choosing Crunchy Cruise!`,
    
  deliveryUpdate: (orderRef: string, location: string) => 
    `Delivery update for order ${orderRef}: Currently at ${location}. We'll be with you soon!`,
    
  promotionalOffer: (customerName: string, offer: string) => 
    `Hi ${customerName}! 🎉 Special offer: ${offer}. Order now at ${process.env.NEXT_PUBLIC_BASE_URL}. As you dey crunch, just dey cruise!`
};

// Send order status SMS
export const sendOrderStatusSMS = async (
  phoneNumber: string, 
  orderRef: string, 
  status: string, 
  additionalInfo?: any
) => {
  let message = '';
  
  switch (status) {
    case 'confirmed':
      message = smsTemplates.orderConfirmation(orderRef, additionalInfo?.total || 0);
      break;
    case 'ready':
      message = smsTemplates.orderReady(orderRef);
      break;
    case 'out_for_delivery':
      message = smsTemplates.orderOutForDelivery(orderRef, additionalInfo?.estimatedTime || '30-60 minutes');
      break;
    case 'delivered':
      message = smsTemplates.orderDelivered(orderRef);
      break;
    case 'cancelled':
      message = smsTemplates.orderCancelled(orderRef, additionalInfo?.reason);
      break;
    default:
      message = `Your Crunchy Cruise order ${orderRef} status has been updated to: ${status}`;
  }
  
  return await sendSMS({ to: phoneNumber, message });
};

// Send promotional SMS
export const sendPromotionalSMS = async (
  phoneNumber: string, 
  customerName: string, 
  offer: string
) => {
  const message = smsTemplates.promotionalOffer(customerName, offer);
  return await sendSMS({ to: phoneNumber, message });
};

// Bulk SMS sending
export const sendBulkSMS = async (recipients: { phone: string; name?: string }[], message: string) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const personalizedMessage = message.replace('{name}', recipient.name || 'Valued Customer');
      const result = await sendSMS({ to: recipient.phone, message: personalizedMessage });
      results.push({ phone: recipient.phone, ...result });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ phone: recipient.phone, success: false, error });
    }
  }
  
  return results;
};