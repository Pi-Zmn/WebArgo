import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ClientSocketService } from './client-socket.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ClientInfo, WorkerClient } from './entity/workerclient.entity';
import { Task } from 'src/job/entities/task.entity';
import { JobService } from 'src/job/job.service';
import { OnEvent } from '@nestjs/event-emitter';
import { JobDto } from 'src/job/dto/job.dto';
import { Status } from 'src/job/entities/job.entity';
import { GatewayUserGuard } from 'src/auth-guard/gateway-user.guard';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  maxHttpBufferSize: 1e8
})
@UseGuards(GatewayUserGuard)
export class ClientSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly clientSocketService: ClientSocketService,
    private readonly jobService: JobService
  ) {}

  @WebSocketServer()
  server: Server;
  
  handleConnection(@ConnectedSocket() client: Socket) {
    Logger.log(`client-WS (${client.id}) connected`)
    this.clientSocketService.create(client.id)
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    Logger.log(`client-WS (${client.id}) disconnected`)
    this.clientSocketService.remove(client.id)
  }

  @SubscribeMessage('client-info')
  handleClientInfo(
    @MessageBody() clientInfo: ClientInfo | undefined,
    @ConnectedSocket() client: Socket
  ) {
    /* Update Client Info with User Agent */
    this.clientSocketService.setClientInfo(client.id, clientInfo);
    /* Emit 'job-activated' to Worker if activeJob */
    if (this.jobService.activeJob) {
      this.server.to(client.id).emit(
        'job-activated', 
        new JobDto(this.jobService.activeJob)
      )
    }
  }

  @SubscribeMessage('worker-ready')
  handleWorkerReady(
    @ConnectedSocket() client: Socket
  ) {
    Logger.log(`client-WS (${client.id}) ready`)
    /* Client is Ready to Work */
    this.clientSocketService.setClientReady(client.id)
    this.sendTaskToWorker(client.id)
  }

  @SubscribeMessage('client-result')
  async handleClientResult(
    @MessageBody() clientResult: Task,
    @ConnectedSocket() client: Socket
  ) {
    Logger.log(`client-WS (${client.id}) send Result`)
    /* Forward Result to JobService and send Next Task to Worker */
    await this.jobService.receiveResult(clientResult)
    this.sendTaskToWorker(client.id)
  }

  /* Emit Next Task to Worker if activeJob up and RUNNING */
  sendTaskToWorker(id: string) {
    if (this.jobService.activeJob && this.jobService.activeJob.status == Status.RUNNING) {
      const nextTask: Task = this.jobService.getNextTasks()
      if (nextTask) {
        this.server.to(id).emit(
          'next-task', 
          nextTask
        )
      } 
      else {
        this.server.to(id).emit(
          'no-task', 
          new JobDto(this.jobService.activeJob)
        )
      }
    }
  }

  @SubscribeMessage('request-task')
  handelWorkerRequestsTask(
    @ConnectedSocket() client: Socket
  ) {
    this.sendTaskToWorker(client.id)
  }

  @OnEvent('job-activated')
  sendJobActivated(activeJob: JobDto) {
    this.clientSocketService.setAllClientsNotReady()
    this.server.emit('job-activated', activeJob)
  }

  @OnEvent('job-started')
  startReadyWorkers() {
    /* Send 'next-task' to all ready workers */
    this.clientSocketService.connectedWorkerClients.forEach((worker: WorkerClient) => {
      if (worker.ready) {
        this.sendTaskToWorker(worker.id)
      }
    });
  }
}
