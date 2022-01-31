export const validator = (data) => {
  const { email, password } = data;
  if (!email || !password || password.length < 6) return false;
  return true;
};
