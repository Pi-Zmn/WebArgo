import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "src/user/entities/user.entity";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const [type, jwt] = context.switchToHttp().getRequest().headers.authorization?.split(' ') ?? []
        
        if (!jwt || type !== 'Bearer') {
            throw new UnauthorizedException()
        }

        try {
            const { user } = await this.jwtService.verifyAsync(
                jwt,
                {
                    secret: process.env.SECRET_KEY || 'SUPER_SECRET_SESSION_KEY',
                }
            )
            if (user.role !== UserRole.Admin) {
                throw new UnauthorizedException()
            }
        } catch (e) {
            throw new UnauthorizedException()
        }
        return true;
    }
}