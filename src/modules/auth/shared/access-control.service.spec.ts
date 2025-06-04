import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlService } from './access-control.service';

describe('AccessControlService', () => {
  let service: AccessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessControlService],
    }).compile();

    service = module.get<AccessControlService>(AccessControlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
