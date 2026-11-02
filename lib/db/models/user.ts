import mongoose, { Schema } from "mongoose";

import type { InferSchemaType, Model } from "mongoose";

/**
 * The identity root. One document per account.
 *
 * Per `docs/database.md` §4: `strict` + `timestamps`, indexed on the fields we
 * query by. `email` is the credential lookup key; `handle` is the public
 * profile key (`/user/[handle]`) and is set later by the select-handle feature,
 * so it is optional and sparsely unique until then.
 *
 * Unlike user-scoped collections (links, etc.), a User carries no `userId` — it
 * *is* the owner that those documents are scoped to.
 */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // creates the unique index; no separate `index: true`
      lowercase: true,
      trim: true,
    },
    // Never selected by default, so a stray query can't leak the hash.
    passwordHash: { type: String, required: true, select: false },
    // Optional display name; the header falls back to the email local-part.
    name: { type: String, trim: true },
    // Set by the separate select-handle feature; unique only among the docs
    // that have one (sparse).
    handle: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
  },
  { strict: true, timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Registered once, then reused from the model cache on subsequent imports
// (hot reload / warm serverless), per `docs/database.md` §3.
export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", userSchema);
