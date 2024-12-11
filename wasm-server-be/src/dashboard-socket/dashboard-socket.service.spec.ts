import { Test, TestingModule } from '@nestjs/testing';
import { DashboardSocketService } from './dashboard-socket.service';

describe('DashboardSocketService', () => {
  let service: DashboardSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardSocketService],
    }).compile();

    service = module.get<DashboardSocketService>(DashboardSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
