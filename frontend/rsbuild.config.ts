import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: "./index.html",
  },
  server: {
    port: 5173
  },
  dev: {
    writeToDisk: true,
  },
  source: {
    define: {
      'process.env.PINATA_JWT': JSON.stringify(process.env.PINATA_JWT),
      'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
      'process.env.MONGODB_URI': JSON.stringify(process.env.MONGODB_URI),
      'process.env.MONGODB_DB': JSON.stringify(process.env.MONGODB_DB),
      'process.env.REPLICATE_API_TOKEN': JSON.stringify(process.env.REPLICATE_API_TOKEN),
      'process.env.CMC_API_KEY': JSON.stringify(process.env.CMC_API_KEY),
    }
  }
});