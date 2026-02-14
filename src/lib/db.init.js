
import "./dotenv";
import { connect } from "mongoose";

async function InitDB_Mongoose() {
  try {
    const mongocon = await connect(process.env.MONGODB_URI || "");
    return { con: mongocon };
  } catch (e) {
    console.log(`[Mongo Init Error]:`, e?.stack);
    return { err: `Application can't connect to the database!`, issues: true };
  }
}

export default InitDB_Mongoose;