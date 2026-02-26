import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const generateAccessToken = (payload: { userId: number; email: string }): string => {
  // Ensure userId is stored as number in token
  return jwt.sign({ userId: payload.userId, email: payload.email }, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN as any 
  });
};

export const generateRefreshToken = (payload: { userId: number; email: string }): string => {
  return jwt.sign({ userId: payload.userId, email: payload.email }, JWT_REFRESH_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRES_IN as any 
  });
};

export const verifyAccessToken = (token: string): { userId: number; email: string } => {
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  // Ensure userId is returned as number
  return { 
    userId: typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId, 
    email: decoded.email 
  };
};

export const verifyRefreshToken = (token: string): { userId: number; email: string } => {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
  return { 
    userId: typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId, 
    email: decoded.email 
  };
};