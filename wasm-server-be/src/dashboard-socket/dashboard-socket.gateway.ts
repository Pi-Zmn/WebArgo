import { ClientSocketService } from './../client-socket/client-socket.service';
import { WorkerClient } from './../client-socket/entity/workerclient.entity';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { DashboardSocketService } from './dashboard-socket.service';
import { JobService } from 'src/job/job.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Job } from 'src/job/entities/job.entity';
import { GatewayAdminGuard } from 'src/auth-guard/gateway-admin.guard';

@WebSocketGateway(3001, {
  cors: {
    origin: '*'
  }
})
@UseGuards(GatewayAdminGuard)
export class DashboardSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly dashboardSocketService: DashboardSocketService,
    private readonly clientSocketService: ClientSocketService,
    private readonly jobService: JobService
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    Logger.log(`dashboard-WS (${client.id}) connected`);
    this.server.to(client.id).emit(
      'client-update', 
      [...this.clientSocketService.connectedWorkerClients.values()]
    )
    this.server.to(client.id).emit(
      'job-update',
      await this.jobService.findAll()
    )
    this.server.to(client.id).emit(
      'activeJob-update',
      this.jobService.activeJob
    )
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    Logger.log(`dashboard-WS (${client.id}) disconnected`);
  }

  @OnEvent('workerclient-update')
  sendConnectedClientInfo(connectedClients: WorkerClient[]) {
    this.server.emit('client-update', connectedClients)
  }

  @OnEvent('job-update')
  sendAllJobs(jobs: Job[]) {
    this.server.emit('job-update', jobs)
  }

  @OnEvent('activeJob-update')
  sendActiveJob(activeJob: Job | undefined) {
    this.server.emit('activeJob-update', activeJob)
  }

  @OnEvent('activeJob-results')
  activeJobResults(activeJob: Job | undefined) {
    this.server.emit('activeJob-results')
  }
}
