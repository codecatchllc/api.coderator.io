import * as argon2 from 'argon2';

/**
 * Hashes the password using bcrypt algorithm
 * @param {string} password - The password to hash
 * @return {string} Password hash
 */
export const generatePasswordHash = async (password: string) => {
  const hash = await argon2.hash(password);
  return hash;
};

/**
 * Validates the password against the hash
 * @param {string} password - The password to verify
 * @param {string} hash - Password hash to verify against
 * @return {boolean} True if the password matches the hash, false otherwise
 */
export const validatePassword = async (password: string, hash: string) => {
  const result = await argon2.verify(hash, password);
  return result;
};

/**
 * Checks that the hash has a valid format
 * @param {string} hash - Hash to check format for
 * @return {boolean} True if passed string seems like valid hash, false otherwise
 */
// export const isPasswordHash = (hash: string) => {
//   if (!hash || hash.length !== 60) return false;
//   try {
//     bcrypt.getRounds(hash);
//     return true;
//   } catch {
//     return false;
//   }
// };
