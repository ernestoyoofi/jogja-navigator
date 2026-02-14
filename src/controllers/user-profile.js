async function User_Profile({ system = {}, middleware = {}, data = {} } = {}) {
  // Middleware Error
  if (middleware.error) {
    return {
      error: middleware.error,
      params: middleware.params,
    }
  }
  return {
    data: {
      id: middleware.profile.id,
      profile: middleware.profile.profile,
      username: middleware.profile.username,
    }
  }
}

export default User_Profile;
