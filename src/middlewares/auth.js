import { validateJWT, toAuthData } from "@/lib/jwt";
import InitDB_Mongoose from "@/lib/db.init";
import User from "@/database/users";

async function Middleware_Auth({ system = {} } = {}) {
  // Test Database
  const dbTest = await InitDB_Mongoose()
  if(dbTest?.err) {
    return {
      error: "database-not-connected"
    }
  }
  const tokenJwt = String(system.cookies["jogjanavigator-auth"]||"")
  // Validate JWT
  if(!validateJWT(tokenJwt)) {
    return {
      skipBuilder: true,
      status: 401,
      redirect: "/login",
      error: "auth:you-need-login"
    }
  }
  // Validate JWT Payload
  const authData = toAuthData(tokenJwt)
  if (authData.isExpired) {
    return {
      skipBuilder: true,
      status: 401,
      redirect: "/login",
      error: "auth:your-credentials-has-expired"
    }
  }
  // Validator By Database
  const user = await User.findOne({ _id: authData.id })
  if (!user) {
    return {
      skipBuilder: true,
      status: 401,
      redirect: "/login",
      error: "auth:you-need-login"
    }
  }
  return {
    skipBuilder: true,
    profile: {
      id: user._id,
      profile: user.profile,
      username: user.username,
      email: user.email,
    }
  }
}

export default Middleware_Auth;
