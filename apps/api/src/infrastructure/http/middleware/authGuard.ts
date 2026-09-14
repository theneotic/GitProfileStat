import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { container } from '../../../config/container.js';
import { AuthenticationError } from '../../../domain/errors/DomainError.js';
import {
  SESSION_COOKIE_NAME,
  SessionService,
} from '../../../application/services/SessionService.js';

export interface IAuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const sessionService = container.resolve(SessionService);

export const authGuard: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const session = bearerToken || req.cookies?.[SESSION_COOKIE_NAME];
  const claims = sessionService.verifySession(session);

  if (!claims) {
    next(new AuthenticationError('Missing or invalid session'));
    return;
  }

  (req as IAuthenticatedRequest).user = { id: claims.sub };
  next();
};
