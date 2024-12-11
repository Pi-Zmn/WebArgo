import { Test, TestingModule } from '@nestjs/testing';
import { DashboardSocketGateway } from './dashboard-socket.gateway';
import { DashboardSocketService } from './dashboard-socket.service';

describe('DashboardSocketGateway', () => {
  let gateway: DashboardSocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardSocketGateway, DashboardSocketService],
    }).compile();

    gateway = module.get<DashboardSocketGateway>(DashboardSocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
