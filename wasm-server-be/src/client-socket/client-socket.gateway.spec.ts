import { Test, TestingModule } from '@nestjs/testing';
import { ClientSocketGateway } from './client-socket.gateway';
import { ClientSocketService } from './client-socket.service';

describe('ClientSocketGateway', () => {
  let gateway: ClientSocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientSocketGateway, ClientSocketService],
    }).compile();

    gateway = module.get<ClientSocketGateway>(ClientSocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
