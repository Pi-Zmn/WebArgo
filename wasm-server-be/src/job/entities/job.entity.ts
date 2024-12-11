import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

export enum Status {
    PENDING,
    ACTIVE,
    RUNNING,
    STOPPED,
    DONE
}

export enum Language {
    C_CPP,
    GO,
    PYTHON
}

export enum ResultType {
    VALUE,
    PNG
}

@Entity()
export class Job {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    progress: number;

    @Column()
    totalTasks: number;

    @Column()
    taskBatchSize: number;

    @Column()
    taskTimeOut: number;

    @Column()
    language: Language;

    @Column()
    resultType: ResultType;

    @Column({nullable: true})
    startTime: Date | null;

    @Column({nullable: true})
    endTime: Date | null;

    @Column()
    runTimeMS: number;

    //@Column()
    //wasm: string;

    //@Column()
    //finalResult?: any;

    /* none DB Properties */
    status: Status;

    tasks: Task[];
}
