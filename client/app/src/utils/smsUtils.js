import axios from 'axios';

const API_KEY = '15747df4-5b99-4c54-b403-f5dcc8731732';
const DEVICE_ID = '6787216fa8d2107e5470a6e9';

const formatPhoneNumber = (phoneNumber) => {
  // Check if the phone number starts with "0" and replace it with "+63"
  if (phoneNumber.startsWith('0')) {
    return '+63' + phoneNumber.slice(1);
  }
  return phoneNumber;
};

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true,
    timeZone: 'Asia/Manila' // Set the time zone to Asia/Manila
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const sendPickupNotification = async (phoneNumber, orderDetails) => {
  // Format the phone number
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

  // Format the pick-up time and date
  const formattedPickUpTimeDate = formatDateTime(orderDetails.pick_up_time_date);

  const message = `Hello ${orderDetails.customer_name}, this is from Trail-Ink Hub. Your printed documents with ID ${orderDetails.id} is now ready for pick-up. Please collect it from ${orderDetails.printer_location} at ${formattedPickUpTimeDate}. Thank you!`;

  console.log('Preparing to send SMS');
  console.log('Phone Number:', formattedPhoneNumber);
  console.log('Order Details:', orderDetails);
  console.log('Message:', message);
  console.log('Device ID:', DEVICE_ID);

  try {
    const response = await axios.post(`https://api.textbee.dev/api/v1/gateway/devices/${DEVICE_ID}/send-sms`, {
      recipients: [formattedPhoneNumber],
      message: message,
    }, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    console.log('Response received from TextBee API');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    if (response.status === 200 || response.status === 201) {
      console.log('SMS sent successfully');
    } else {
      console.error('Failed to send SMS', response.data);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
  }
};