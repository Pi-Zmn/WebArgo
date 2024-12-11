/* Job.Status from Backend */
export enum Status {
    PENDING,
    ACTIVE,
    RUNNING,
    STOPPED,
    DONE
}

/* Job.Language from Backend */
export enum Language {
    C_CPP,
    GO,
    PYTHON,
    NOT_FOUND
}

/* Job.ResultType from Backend */
export enum ResultType {
    VALUE,
    PNG
}

/* JobDTO from Banckend */
export interface Job {
    id: number;
    name: string;
    status: Status;
    progress: number;
    totalTasks: number;
    taskBatchSize: number;
    taskTimeOut: number;
    language: Language;
    resultType: ResultType;
    startTime: Date | null;
    endTime: Date | null;
    runTimeMS: number;
    //wasm: string;
    //finalResult?: any;
}

export interface ActiveJob extends Job {
    status: Status;
    tasks: Task[];
}

/* Task Entity Backend */
export interface Task {
    id: number;
    jobId: number;
    timeOut: number;
    scheduledAt: undefined | Date;
    done: boolean;
    runTime: undefined | number;
    input: string[];
    result: any;
}
