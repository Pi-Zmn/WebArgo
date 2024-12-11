import { Test, TestingModule } from '@nestjs/testing';
import { ClientSocketService } from './client-socket.service';

describe('ClientSocketService', () => {
  let service: ClientSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientSocketService],
    }).compile();

    service = module.get<ClientSocketService>(ClientSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
