import { Job, Language, Status, ResultType } from "../entities/job.entity";

export class JobDto {
    constructor(job: Job) {
        this.id = job.id;
        this.name = job.name;
        this.status = job.status;
        this.progress = job.progress;
        this.totalTasks = job.totalTasks;
        this.taskBatchSize = job.taskBatchSize;
        this.taskTimeOut = job.taskTimeOut;
        this.language = job.language;
        this.resultType = job.resultType;
        this.startTime = job.startTime;
        this.endTime = job.endTime;
        this.runTimeMS = job.runTimeMS;
    }

    id: number;

    name: string;

    status: Status;

    progress: number;

    totalTasks: number;

    taskBatchSize: number;

    taskTimeOut: number;

    language: Language;

    resultType: ResultType

    startTime: Date | null;

    endTime: Date | null;

    runTimeMS: number;

    //wasm: string;

    //finalResult?: any;
}
