import { Module } from '@nestjs/common';
import { ClientSocketService } from './client-socket.service';
import { ClientSocketGateway } from './client-socket.gateway';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [JobModule],
  providers: [ClientSocketGateway, ClientSocketService],
  exports: [ClientSocketService]
})
export class ClientSocketModule {}
