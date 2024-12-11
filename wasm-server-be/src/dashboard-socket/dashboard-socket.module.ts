import { Module } from '@nestjs/common';
import { DashboardSocketService } from './dashboard-socket.service';
import { DashboardSocketGateway } from './dashboard-socket.gateway';
import { ClientSocketModule } from 'src/client-socket/client-socket.module';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [ClientSocketModule, JobModule],
  providers: [DashboardSocketGateway, DashboardSocketService],
})
export class DashboardSocketModule {}
