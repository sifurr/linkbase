import mongoose, { Schema } from "mongoose";

import type { InferSchemaType, Model } from "mongoose";

/**
 * A single link on a user's public page. User-scoped: unlike `User` (which *is*
 * the owner), every Link carries an indexed `userId`, and every query is scoped
 * to the session user (`docs/database.md` §4).
 */
const linkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Length is enforced above the DB by Zod; `maxlength` is a backstop.
    title: { type: String, required: true, trim: true, maxlength: 100 },
    url: { type: String, required: true, trim: true },
  },
  { strict: true, timestamps: true },
);

// The dashboard list query: a user's links, newest first.
linkSchema.index({ userId: 1, createdAt: -1 });

export type LinkDoc = InferSchemaType<typeof linkSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Registered once, then reused from the model cache (hot reload / warm
// serverless), per `docs/database.md` §3.
export const Link: Model<LinkDoc> =
  (mongoose.models.Link as Model<LinkDoc>) ??
  mongoose.model<LinkDoc>("Link", linkSchema);
