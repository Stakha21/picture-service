const validateUserData = (data) => {
  const { email, password } = data;
  if (!email || !password || password.length < 6) return false;
  return true;
};

const validatePictureData = (data) => {
  const { image } = data;
  if (!image) return false;
  return true;
};

export { validateUserData, validatePictureData };
