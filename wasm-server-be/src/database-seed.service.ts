import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user/entities/user.entity';
import { Job, Language, ResultType, Status } from './job/entities/job.entity';

@Injectable()
export class DatabaseSeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async createSeed() {
    /* Only Create default User if table is empty */
    if (await this.userRepository.count() === 0) {
      const defaultUser: User = {
        id: 1,
        name: 'AdminUser-Masterarbeit-FBI-Hda',
        role: UserRole.Admin,
        password: '$2b$04$OUfzXg0q2uEYfPztjy.PXeOLoLHuCM0cvCYiigKu8Q55.l44BHNqi'
      } 
      await this.userRepository.save(defaultUser);
      Logger.log('Added Default User to Database');
    }

    /* Only Create Jobs if table is empty */
    if (await this.jobRepository.count() === 0) {
        const jobs: Job[] = [
          {
            id: 1,
            name: 'mandelbrot-cpp',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 1,
            taskTimeOut: 60,
            language: Language.C_CPP,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 2,
            name: 'mandelbrot2x2-cpp',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 10,
            taskTimeOut: 60,
            language: Language.C_CPP,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 3,
            name: 'mandelbrot10x10-cpp',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 101,
            taskTimeOut: 60,
            language: Language.C_CPP,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 4,
            name: 'mandelbrotHeavy-cpp',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 1,
            taskTimeOut: 60,
            language: Language.C_CPP,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 5,
            name: 'mandelbrot-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 1,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 6,
            name: 'mandelbrot2x2-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 10,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 7,
            name: 'mandelbrot4x4-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 10,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 8,
            name: 'mandelbrot10x10-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 101,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 9,
            name: 'mandelbrot20x20-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 100,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 10,
            name: 'mandelbrot100x100-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 100,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 11,
            name: 'mandelbrotHeavy-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 1,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.PNG,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 12,
            name: 'primes-cpp',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 10,
            taskTimeOut: 60,
            language: Language.C_CPP,
            resultType: ResultType.VALUE,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 13,
            name: 'primes-go',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 10,
            taskTimeOut: 60,
            language: Language.GO,
            resultType: ResultType.VALUE,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          },
          {
            id: 14,
            name: 'primes-py',
            progress: 0,
            totalTasks: 0,
            taskBatchSize: 10,
            taskTimeOut: 60,
            language: Language.PYTHON,
            resultType: ResultType.VALUE,
            startTime: null,
            endTime: null,
            runTimeMS: 0,
            status: Status.PENDING,
            tasks: []
          }
        ]
        await this.jobRepository.save(jobs);
        Logger.log('Added Jobs to Database');
      }
  }
}
