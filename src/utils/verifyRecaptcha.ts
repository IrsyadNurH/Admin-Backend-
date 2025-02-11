import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RECAPTCHA_SECRET_KEY) {
  throw new Error('RECAPTCHA_SECRET_KEY is not defined in environment variables');
}

const verifyRecaptcha = async (recaptchaToken: string): Promise<boolean> => {
  if (!recaptchaToken) {
    console.error("No reCAPTCHA token provided");
    return false;
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (response.data.success) {
      console.log("reCAPTCHA verified successfully");
      return true;
    } else {
      console.error("reCAPTCHA verification failed", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
};

export { verifyRecaptcha };