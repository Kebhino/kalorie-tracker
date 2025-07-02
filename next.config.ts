/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MY_AWS_ACCESS_KEY_ID: process.env.MY_AWS_ACCESS_KEY_ID ?? "",
    MY_AWS_SECRET_ACCESS_KEY: process.env.MY_AWS_SECRET_ACCESS_KEY ?? "",
    MY_AWS_REGION: process.env.MY_AWS_REGION ?? "eu-central-1",
    DYNAMO_WAGA_TABLE: process.env.DYNAMO_WAGA_TABLE ?? "Waga",
    DYNAMO_TABLE: process.env.DYNAMO_TABLE ?? "Posilki",
  },
};

export default nextConfig;
