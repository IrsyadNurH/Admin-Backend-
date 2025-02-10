import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "6Lfmx9EqAAAAAMJxAA_46697kk8Anik_eC6Hs5kO";

const verifyRecaptcha = async (recaptchaToken: string) => {
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
          secret: SECRET_KEY,
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