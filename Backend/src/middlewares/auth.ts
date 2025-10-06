import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/types';

interface AuthRequest extends Request {
  user?: User;
}
// Phần mềm trung gian để xác thực mã thông báo JWT
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
// Nếu không có token, trả về lỗi
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
// Xác minh token
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
// Tạo JWT token cho user
export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      githubId: user.githubId 
    }, 
    // Chữ ký bí mật để mã hóa token
    process.env.JWT_SECRET!, 
    { expiresIn: '24h' }
  );
};

export { AuthRequest };