// ─── Types ───────────────────────────────────────────────
export type ValidationError = Record<string, string>;

// ─── Helpers ─────────────────────────────────────────────
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v: string) => /^(\+63|0)[0-9]{9,10}$/.test(v.replace(/\s/g, ""));
const isStrongPassword = (v: string) => v.length >= 8;

// ─── Register ────────────────────────────────────────────
export function validateRegister(data: {
  firstName?: string; lastName?: string;
  email?: string; password?: string; phone?: string;
}): ValidationError {
  const errors: ValidationError = {};

  if (!data.firstName?.trim()) errors.firstName = "First name is required.";
  else if (data.firstName.trim().length < 2) errors.firstName = "First name must be at least 2 characters.";

  if (!data.lastName?.trim()) errors.lastName = "Last name is required.";
  else if (data.lastName.trim().length < 2) errors.lastName = "Last name must be at least 2 characters.";

  if (!data.email?.trim()) errors.email = "Email is required.";
  else if (!isEmail(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.password) errors.password = "Password is required.";
  else if (!isStrongPassword(data.password)) errors.password = "Password must be at least 8 characters.";

  if (data.phone && !isPhone(data.phone)) errors.phone = "Enter a valid PH phone number (e.g. 09XX XXX XXXX).";

  return errors;
}

// ─── Login ───────────────────────────────────────────────
export function validateLogin(data: { email?: string; password?: string }): ValidationError {
  const errors: ValidationError = {};

  if (!data.email?.trim()) errors.email = "Email is required.";
  else if (!isEmail(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.password) errors.password = "Password is required.";

  return errors;
}

// ─── Order ───────────────────────────────────────────────
export function validateOrder(data: {
  customerName?: string; phone?: string;
  address?: string; payment?: string; items?: unknown[];
}): ValidationError {
  const errors: ValidationError = {};

  if (!data.customerName?.trim()) errors.customerName = "Full name is required.";
  else if (data.customerName.trim().length < 3) errors.customerName = "Please enter your full name.";

  if (!data.phone?.trim()) errors.phone = "Phone number is required.";
  else if (!isPhone(data.phone)) errors.phone = "Enter a valid PH phone number (e.g. 09XX XXX XXXX).";

  if (!data.address?.trim()) errors.address = "Delivery address is required.";
  else if (data.address.trim().length < 10) errors.address = "Please enter a complete address.";

  if (!data.payment) errors.payment = "Please select a payment method.";

  if (!data.items || data.items.length === 0) errors.items = "Your cart is empty.";

  return errors;
}

// ─── Product ─────────────────────────────────────────────
export function validateProduct(data: {
  name?: string; description?: string;
  price?: unknown; stock?: unknown; category?: string;
}): ValidationError {
  const errors: ValidationError = {};

  if (!data.name?.trim()) errors.name = "Product name is required.";
  else if (data.name.trim().length < 3) errors.name = "Name must be at least 3 characters.";

  if (!data.description?.trim()) errors.description = "Description is required.";
  else if (data.description.trim().length < 10) errors.description = "Description must be at least 10 characters.";

  if (!data.price) errors.price = "Price is required.";
  else if (isNaN(Number(data.price)) || Number(data.price) <= 0) errors.price = "Price must be a positive number.";

  if (data.stock === undefined || data.stock === "") errors.stock = "Stock is required.";
  else if (isNaN(Number(data.stock)) || Number(data.stock) < 0) errors.stock = "Stock must be 0 or more.";

  if (!data.category) errors.category = "Category is required.";

  return errors;
}

// ─── Helper: has errors ──────────────────────────────────
export const hasErrors = (e: ValidationError) => Object.keys(e).length > 0;

// ─── Forgot Password ─────────────────────────────────────
export function validateForgotPassword(data: {
  email?: string; securityAnswer?: string; newPassword?: string; confirmPassword?: string;
}): ValidationError {
  const errors: ValidationError = {};

  if (!data.email?.trim()) errors.email = "Email is required.";
  else if (!isEmail(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.securityAnswer?.trim()) errors.securityAnswer = "Security answer is required.";

  if (!data.newPassword) errors.newPassword = "New password is required.";
  else if (!isStrongPassword(data.newPassword)) errors.newPassword = "Password must be at least 8 characters.";

  if (!data.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (data.newPassword !== data.confirmPassword) errors.confirmPassword = "Passwords do not match.";

  return errors;
}
