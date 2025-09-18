import dotenv from "dotenv";

dotenv.config();

const config = {
  FRONTEND_URL: process.env.FRONTEND_URL,
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
};

export default config;
