const validators = {
  name: (val) => {
    if (!val || val.trim().length < 20)
      return "Name must be at least 20 characters.";
    if (val.trim().length > 60) return "Name must be at most 60 characters.";
    return null;
  },
  email: (val) => {
    if (!val) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
      return "Please enter a valid email address.";
    return null;
  },
  password: (val) => {
    if (!val || val.length < 8)
      return "Password must be at least 8 characters.";
    if (val.length > 16) return "Password must be at most 16 characters.";
    if (!/[A-Z]/.test(val))
      return "Password must contain at least one uppercase letter.";
    if (!/[^a-zA-Z0-9]/.test(val))
      return "Password must contain at least one special character.";
    return null;
  },
  address: (val) => {
    if (val && val.length > 400)
      return "Address must be at most 400 characters.";
    return null;
  },
};

export const validateSignupForm = (data) => {
  const errors = {};
  const nameErr = validators.name(data.name);
  const emailErr = validators.email(data.email);
  const pwErr = validators.password(data.password);
  const addrErr = validators.address(data.address);

  if (nameErr) errors.name = nameErr;
  if (emailErr) errors.email = emailErr;
  if (pwErr) errors.password = pwErr;
  if (addrErr) errors.address = addrErr;
  return errors;
};

export const validateLoginForm = (data) => {
  const errors = {};
  if (!data.email) errors.email = "Email is required.";
  if (!data.password) errors.password = "Password is required.";
  return errors;
};

export const validateUserForm = (data) => {
  const errors = {};
  const nameErr = validators.name(data.name);
  const emailErr = validators.email(data.email);
  const pwErr = data.password ? validators.password(data.password) : null;
  const addrErr = validators.address(data.address);

  if (nameErr) errors.name = nameErr;
  if (emailErr) errors.email = emailErr;
  if (pwErr) errors.password = pwErr;
  if (addrErr) errors.address = addrErr;
  return errors;
};

export default validators;
