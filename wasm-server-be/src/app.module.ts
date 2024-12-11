import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobModule } from './job/job.module';
import { Job } from './job/entities/job.entity';
import { ClientSocketModule } from './client-socket/client-socket.module';
import { DashboardSocketModule } from './dashboard-socket/dashboard-socket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [JobModule, ClientSocketModule, DashboardSocketModule, UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'secret',
      database: 'mydatabase',
      entities: [Job, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Job]),
    EventEmitterModule.forRoot(),
    /*ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'wasm'),
      serveRoot: '/wasm/',
      serveStaticOptions: {
        index: false
      },
    }),*/
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeedService],
})
export class AppModule {
  constructor(
    private readonly databaseSeedService: DatabaseSeedService
  ) {}

  async onModuleInit() {
    await this.databaseSeedService.createSeed()
  }
}
