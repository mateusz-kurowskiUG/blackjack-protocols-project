import mongoose from 'mongoose';
const { Schema } = mongoose;

export const Game = new Schema({
    id:String,
    userId: String,
    stake: Number,
    won: Boolean,
    createdAt: Date,
    updatedAt: Date,
});

export const User = new Schema({
id: String,
name:String,
balance:Number,
password:String,
});
