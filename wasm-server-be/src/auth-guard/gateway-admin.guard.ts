import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "src/user/entities/user.entity";

@Injectable()
export class GatewayAdminGuard implements CanActivate {
    constructor(
        private jwtService: JwtService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient()
        const jwt = client.handshake?.auth?.token

        if (!jwt) {
            client.disconnect()
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
                client.disconnect()
                throw new UnauthorizedException()
            }
        } catch (e) {
            client.disconnect()
            throw new UnauthorizedException()
        }
        return true;
    }
}