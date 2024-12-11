import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException, Res, ForbiddenException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './dto/job.dto';
import { Job } from './entities/job.entity';
import { AdminGuard } from 'src/auth-guard/admin.guard';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() jobDto: JobDto): Promise<Job> {
    return this.jobService.create(jobDto); 
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll(): Promise<JobDto[] | void> {
    return this.jobService.findAll().then((jobs) => {
      return jobs.map((job) => new JobDto(job))
    });
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<JobDto> {
    return this.jobService.findOne(+id).then((job) => {
      if (!job) {
        throw new NotFoundException();
      }
      return new JobDto(job);
    });
  }

  @UseGuards(AdminGuard)
  @Get('active')
  getActiveJob(): JobDto {
    if (this.jobService.activeJob) {
      return new JobDto(this.jobService.activeJob)
    }
    throw new NotFoundException();
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() jobDto: JobDto): Promise<JobDto> {
    return this.jobService.update(+id, jobDto).then((job) => {
      if (!job) {
        throw new NotFoundException();
      }
      return new JobDto(job);
    });
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.jobService.remove(+id);
    return `Deleted Job #${id}`; 
  }

  /* Returns Started Job DTO or throws exception */
  @UseGuards(AdminGuard)
  @Get('activate/:id')
  async activateJob(@Param('id') id: number) {
    /* TODO: Check for running job instead (global running boolean?)
    if(this.jobService.activeJob) {
      throw new ForbiddenException(`Can not Activate Job #${id} while 
        Job #${this.jobService.activeJob.id} is active`)
    }*/

    const jobToActivate = await this.jobService.findOne(+id)
    if (!jobToActivate) {
      throw new NotFoundException();
    }
    await this.jobService.activate(jobToActivate)
    return new JobDto(jobToActivate)
  }

  @UseGuards(AdminGuard)
  @Get('start')
  async startJob() {
    if(await this.jobService.start()) {
      return true
    }
    throw new ForbiddenException(`Can not Start Job`) 
  }

  @UseGuards(AdminGuard)
  @Get('stop')
  stopJob() {
    if(this.jobService.stop()) {
      return true
    }
    throw new ForbiddenException(`Can not Stop Job`)
  }

  @UseGuards(AdminGuard)
  @Get('reset')
  resetJob(@Param('id') id: number) {
    if(this.jobService.reset()) {
      return true
    }
    throw new ForbiddenException(`Can not Reset Job`)
  }
}
