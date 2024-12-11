import { Injectable, Logger } from '@nestjs/common';
import { JobDto } from './dto/job.dto';
import { Job, ResultType, Status } from './entities/job.entity';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as path from 'path';
import { createWriteStream, writeFile, writeFileSync } from 'fs';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private eventEmitter: EventEmitter2
  ) {}

  activeJob: Job | undefined = undefined;

  async create(jobDto: JobDto): Promise<Job> {
    const newJob: Job = new Job();
    newJob.name = jobDto.name;
    newJob.status = jobDto.status;
    newJob.progress = jobDto.progress;
    newJob.totalTasks = jobDto.totalTasks;
    newJob.taskBatchSize = jobDto.taskBatchSize;
    newJob.taskTimeOut = jobDto.taskTimeOut;
    newJob.language = jobDto.language;
    newJob.resultType = jobDto.resultType;
    newJob.startTime = jobDto.startTime;
    newJob.endTime = jobDto.endTime;
    newJob.runTimeMS = jobDto.runTimeMS;
    
    const savedJob = await this.jobRepository.save(newJob);
    this.publishJobUpdate()
    return savedJob
  }

  async findAll(): Promise<Job[]> {
    return await this.jobRepository.find();
  }

  async findOne(id: number): Promise<Job> {
    return await this.jobRepository.findOneBy({ id });
  }

  async update(id: number, jobDto: JobDto): Promise<Job> { 
    const jobToUpdate: Job = await this.jobRepository.findOneBy({ id });
    if (!jobToUpdate) {
      return null;
    }
    jobToUpdate.name = jobDto.name;
    jobToUpdate.status = jobDto.status;
    jobToUpdate.progress = jobDto.progress;
    jobToUpdate.totalTasks = jobDto.totalTasks;
    jobToUpdate.taskBatchSize = jobDto.taskBatchSize;
    jobToUpdate.taskTimeOut = jobDto.taskTimeOut;
    jobToUpdate.language = jobDto.language;
    jobToUpdate.resultType = jobDto.resultType;
    jobToUpdate.startTime = jobDto.startTime;
    jobToUpdate.endTime = jobDto.endTime;
    jobToUpdate.runTimeMS = jobDto.runTimeMS;

    const updatedJob = await this.jobRepository.save(jobToUpdate)
    this.publishJobUpdate()
    return updatedJob;
  }

  async remove(id: number) {
    await this.jobRepository.delete(id);
    this.publishJobUpdate()
  }

  async generateTasks(job: Job): Promise<Task[]> { 
    /* NPM Package to read a file Line by Line */
    const lineByLine = require('n-readlines');
    const liner = new lineByLine(path.join(__dirname, '../../wasm', job.name, 'input.txt'));
    
    let line;
    let lineNumber = 0;
    const newTasks: Task[] = []
    
    while ((lineNumber < job.progress + job.taskBatchSize) && (line = liner.next())) {
      if (lineNumber >= job.progress) {
        newTasks.push({
          id: lineNumber,
          jobId: job.id,
          timeOut: job.taskTimeOut,
          scheduledAt: undefined,
          done: false,
          runTime: undefined,
          input: line.toString('utf-8').split(" "),
          result: undefined
        })
      }
      lineNumber++;
    }
    return newTasks;
  }

  async getNumOfTotalTasks(jobName: string): Promise<number> {
    /* NPM Package to read a file Line by Line */
    const lineByLine = require('n-readlines');
    const liner = new lineByLine(path.join(__dirname, '../../wasm', jobName, 'input.txt'));
    
    let totalTasks = 0;
    while (liner.next()) {
      totalTasks++;
    }
    return totalTasks;
  }

  /* 
   * Returns next Scheduled Task
   * OR
   * calls new Logic if all Tasks are Done
  */
  getNextTasks(): Task | null {
    /* only get task from a active and running Job */
    if(this.activeJob && Status[this.activeJob.status] == 'RUNNING') {
      // TODO: Improve Scheduling Algorithm (Currently FIFO?)
      const now = new Date()
      /* Get first Task that is not done and not scheduled */
      let nextTaskIndex = this.activeJob.tasks.findIndex((t) => {
        if(!t.done && t.scheduledAt === undefined) {
          /* Task is not done AND not scheduled */
          return true;
        }
      })

      if (nextTaskIndex == -1) {
        /* Get first Task where timeout period is expired */
        nextTaskIndex = this.activeJob.tasks.findIndex((t) => {
          if(!t.done) {
            if(t.scheduledAt &&
              /* calculate time in seconds */
              Math.floor((now.getTime() - t.scheduledAt.getTime()) / 1000)
              < this.activeJob.taskTimeOut) {
              return false
            }
            /* Task is not done AND not scheduled OR scheduled longer than timeOut */
            return true;
          }
        })
      }

      if (nextTaskIndex == -1) {
        return null
      }

      this.activeJob.tasks[nextTaskIndex].scheduledAt = now;
      this.publishActiveJobUpdate()
      return this.activeJob.tasks[nextTaskIndex]
    }
  }

  async receiveResult(task: Task) {
    if(this.activeJob && this.activeJob.id == task.jobId && Status[this.activeJob.status] != 'DONE') {
      // TODO combine both find loops to only one for performance?
      const updateTaskIndex = this.activeJob.tasks.findIndex((t) => !t.done && t.id == task.id)
      if (updateTaskIndex >= 0) {
        /* Replace scheduled Task with Result if not already done */
        switch(this.activeJob.resultType) {
          case ResultType.VALUE:
            /* Forward Worker Result to Task result */
            this.activeJob.tasks[updateTaskIndex] = task
            break;
          case ResultType.PNG:
            /* Result Value holds BLOB of a PNG File:
            * 1. Save PNG in results Folder
            * 2. Set Filename as result-Value of Task */
            const filePath = path.join(__dirname, '../../wasm', this.activeJob.name, 'results', `Task-${task.id}.png`)
            try {
              writeFileSync(filePath, task.result);
              Logger.log(`PNG file saved file of task #: ${task.id}`);
              this.activeJob.tasks[updateTaskIndex].done = task.done;
              this.activeJob.tasks[updateTaskIndex].runTime = task.runTime;
              this.activeJob.tasks[updateTaskIndex].result = filePath;
            } catch (err) {
              Logger.error(`Error saving PNG file of task #: ${task.id}`, err);
              // TODO: Handle Error Case - currently: Don't use Result on Error (?)
            }
            /*writeFile(filePath, task.result, (err) => {
              if (err) {
                console.error(`Error saving PNG file of task #: ${task.id}`, err);
                // TODO: Handle Error Case - currently: Don't use Result on Error (?)
              } else {
                console.log(`PNG file saved file of task #: ${task.id}`);
                this.activeJob.tasks[updateTaskIndex].done = task.done;
                this.activeJob.tasks[updateTaskIndex].runTime = task.runTime;
                this.activeJob.tasks[updateTaskIndex].result = filePath;
              }
            });*/
            break;
          default:
            /* Default Case like VALUE case */
            this.activeJob.tasks[updateTaskIndex] = task
            break;
        }
      }
      
      /* Check if all tasks are done */
      const pendingTaskIndex = this.activeJob.tasks.findIndex((t) => !t.done)
      if (pendingTaskIndex == -1) {
        /* All Tasks Done | Stop Job and get new Tasks */
        if (Status[this.activeJob.status] == 'RUNNING') {
          Logger.log('Task Batch Done')
          this.stop()
          this.allTasksDone()
          return
        }
      }
      this.publishActiveJobUpdate() 
    }
  }

  /* Saves all Results from Task in .txt and Updates Job Progress */
  async saveResults() {
    if (this.activeJob && Status[this.activeJob.status] != 'RUNNING') {
      const resultStream = createWriteStream(
        path.join(__dirname, '../../wasm', this.activeJob.name, 'result.txt'),
        {flags: 'a'}
      )
      //let totalTime = 0
      for (let task of this.activeJob.tasks) {
        if (task.done) {
          resultStream.write(JSON.stringify(task.result) + '\n')
          this.activeJob.progress = this.activeJob.progress + 1
          //totalTime = totalTime + t.runTime
        } else {
          /* Discard all results after one missing Result in order */
          resultStream.end()
          break
        }
      }
      resultStream.end()

      this.publishActiveJobResults()
    }
  } 

  async allTasksDone() {
    if (this.activeJob && Status[this.activeJob.status] != 'RUNNING' && this.activeJob.tasks.length > 0) {
      await this.saveResults()
      if (this.activeJob.progress < this.activeJob.totalTasks) {
        /* Prepare Job with new Tasks */
        this.update(this.activeJob.id, new JobDto(this.activeJob))
        this.activeJob.tasks = await this.generateTasks(this.activeJob);
        await this.start()
      } else {  
        /* Job is DONE */
        this.activeJob.status = Status.DONE
        this.activeJob.endTime = new Date()
        this.activeJob.runTimeMS = this.activeJob.endTime.getTime() - this.activeJob.startTime.getTime()
        this.update(this.activeJob.id, new JobDto(this.activeJob))
        this.publishActiveJobUpdate() 
      }
    }
  }

  async activate(job: Job) {
    Logger.log(`activated Job #${job.id}`)
    if(!this.activeJob ||
       this.activeJob && this.activeJob.id !== job.id && 
       Status[this.activeJob.status] !== 'RUNNING') {
        /* Stop and Save Previous Active Job */
        if (this.activeJob) {
          this.stop()
          if (this.activeJob && this.activeJob.progress < this.activeJob.totalTasks) {
            await this.saveResults()
            await this.update(this.activeJob.id, new JobDto(this.activeJob))
          }
        }
        this.activeJob = job;
        /* Check if Job is Already done */
        if (this.activeJob.progress != 0 && this.activeJob.progress >= this.activeJob.totalTasks) {
          this.activeJob.status = Status.DONE;
        } else {
          this.activeJob.status = Status.ACTIVE; 
          this.activeJob.tasks = await this.generateTasks(job);
          if (job.totalTasks == 0) {
            this.activeJob.totalTasks = await this.getNumOfTotalTasks(job.name)
            /* Save totalTasks to DB */
            this.update(this.activeJob.id, new JobDto(this.activeJob))
          }
        }       
        this.publishActiveJobUpdate()
        this.publishJobActivated()
    }   
  }

  async start(): Promise<boolean> {
    if (this.activeJob) {
      Logger.log(`started Job: ${this.activeJob.name}`)
      /* Generate Tasks if Job has been Reset */
      if (this.activeJob && this.activeJob.tasks.length == 0) {
        this.activeJob.tasks = await this.generateTasks(this.activeJob);
      }
      this.activeJob.status = Status.RUNNING
      if (this.activeJob && !this.activeJob.startTime) {
        this.activeJob.startTime = new Date()
      }
      this.publishActiveJobUpdate()
      this.publishJobStarted() 
      return true
    }
    return false 
  }

  stop(): boolean {
    if (this.activeJob) {
      Logger.log(`stopped Job: ${this.activeJob.name}`)
      this.activeJob.status = Status.STOPPED
      this.publishActiveJobUpdate() 
      return true
    }
    return false
  }

  reset(): boolean {
    if (this.activeJob) {
      Logger.log(`reset Job: ${this.activeJob.name}`)
      this.activeJob.status = Status.STOPPED
      this.activeJob.progress = 0
      this.activeJob.tasks = []
      this.activeJob.startTime = null
      this.activeJob.endTime = null
      this.activeJob.runTimeMS = 0

      /* Delete result.txt */
      const resultStream = createWriteStream(
        path.join(__dirname, '../../wasm', this.activeJob.name, 'result.txt'),
        {flags: 'w'}
      )
      resultStream.write('')
      resultStream.end()

      this.update(this.activeJob.id, new JobDto(this.activeJob))
      this.publishActiveJobUpdate() 
      return true
    }
    return false 
  }

  /* Publish 'job-update' Event to notify Dashboard Socket */
  async publishJobUpdate() {
    this.eventEmitter.emit('job-update', await this.jobRepository.find())
  }

  /* Publish 'activeJob-update' Event to notify Dashboard Socket */
  publishActiveJobUpdate() {
    this.eventEmitter.emit('activeJob-update', this.activeJob)
  }

  /* Publish 'activeJob-results' Event to notify Dashboard Socket */
  publishActiveJobResults() {
    this.eventEmitter.emit('activeJob-results', this.activeJob.name)
  }

  /* Publish 'job-activated' Event to notify Worker Socket */
  publishJobActivated() {
    this.eventEmitter.emit('job-activated', new JobDto(this.activeJob))
  }

  /* Publish 'job-started' Event to notify Worker Socket */
  publishJobStarted() {
    this.eventEmitter.emit('job-started')
  }
}
