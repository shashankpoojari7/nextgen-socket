import mongoose, { Schema, Document } from "mongoose";
import * as argon2 from "argon2";

const PEPPER: string = process.env.PEPPER_KEY!;

export interface UserType extends Document {
  _id: mongoose.Types.ObjectId
  email: string;
  authProvider: string;
  emailVerified: Date;
  password: string;
  mobile: string;
  username: string;
  fullname: string;
  dob: Date;
  bio?: string;
  profile_image?: string;
  isPrivate?: boolean;
  followersCount: number;
  followingCount: number;
  createdAt?: Date;
  updatedAt?: Date;

  isPasswordCorrect(password: string): Promise<boolean>;
}

const userSchema: Schema<UserType> = new Schema(
  {
    email: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["credentials", "google", "github", "facebook", "apple"],
      default: "credentials",
    },
    emailVerified: {
      type: Date
    },
    password: {
      type: String,
    },
    mobile: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
    },
    bio: {
      type: String,
      default: "",
    },
    profile_image: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const pepperedPassword = this.password + PEPPER;
    this.password = await argon2.hash(pepperedPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  const pepperedPassword = password + PEPPER;

  console.log(PEPPER);
  console.log(pepperedPassword);
  
  return await argon2.verify(this.password, pepperedPassword);
};

const User = (mongoose.models.User as mongoose.Model<UserType>) || mongoose.model("User", userSchema);

export default User;