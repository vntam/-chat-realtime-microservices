import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Extract token from Authorization header or cookie
    const token =
      this.extractTokenFromHeader(request) ||
      this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // Verify and decode token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'supersecret_access',
      });

      // Attach user data to request
      request.user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader: string | undefined = request.headers.authorization;
    if (!authHeader) return undefined;

    const parts: string[] = authHeader.split(' ');
    if (parts[0] !== 'Bearer' || !parts[1]) return undefined;

    return parts[1];
  }

  private extractTokenFromCookie(request: any): string | undefined {
    return request.cookies?.accessToken as string | undefined;
  }
}
