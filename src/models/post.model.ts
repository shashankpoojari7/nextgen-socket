import mongoose, { Schema, Document, Types } from "mongoose";

export interface Post extends Document {
  userId: Types.ObjectId;
  imageUrl: string;
  caption?: string;
  location?: string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema: Schema<Post> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    location: {
      type: String,
      default: ""
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Post =
  (mongoose.models.Post as mongoose.Model<Post>) ||
  mongoose.model<Post>("Post", postSchema);

export default Post;
