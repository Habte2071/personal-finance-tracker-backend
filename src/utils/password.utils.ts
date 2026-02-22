import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    // Normalize hash format if needed (handle $2b$ vs $2a$)
    const normalizedHash = hash.startsWith('$2y$') 
      ? '$2a$' + hash.slice(4)
      : hash;
    
    return await bcrypt.compare(password, normalizedHash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};