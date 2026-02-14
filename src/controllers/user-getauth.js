import { toAuthToken } from "@/lib/jwt"
import User from "@/database/users"
import InitDB_Mongoose from "@/lib/db.init";

async function User_GetAuth({ system = {}, data = { name: "", picture: "", email: "", id: "" } } = {}) {
  const dbTest = await InitDB_Mongoose()
  if(dbTest?.err) {
    return {
      error: "database-not-connected"
    }
  }

  let user = await User.findOne({ email: data.email });

  if (!user) {
    user = await User.create({
      profile: data.picture,
      username: data.name,
      email: data.email,
    });
  };

  const createToken = toAuthToken({
    id: user._id,
    email: user.email,
  });

  return {
    set_cookie: [
      {
        key: "jogjanavigator-auth",
        value: createToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        },
      },
    ],
    redirect: "/",
    data: {
      id: user._id,
      token: createToken
    }
  };
}

export default User_GetAuth;