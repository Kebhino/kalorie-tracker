/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DYNAMO_TABLE: process.env.DYNAMO_TABLE,
    DYNAMO_WAGA_TABLE: process.env.DYNAMO_WAGA_TABLE,
    MY_AWS_REGION: process.env.MY_AWS_REGION,
    MY_AWS_ACCESS_KEY_ID: process.env.MY_AWS_ACCESS_KEY_ID,
    MY_AWS_SECRET_ACCESS_KEY: process.env.MY_AWS_SECRET_ACCESS_KEY,
  },
};

export default nextConfig;
