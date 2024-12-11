export class Task {
    id: number;
    jobId: number;
    timeOut: number;
    scheduledAt: undefined | Date;
    done: boolean;
    runTime: undefined | number;
    input: string[];
    result: any;
}
