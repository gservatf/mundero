import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { Request, Response } from "express";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request: Request, response: Response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// Export funnel functions
export * from "./funnels";
