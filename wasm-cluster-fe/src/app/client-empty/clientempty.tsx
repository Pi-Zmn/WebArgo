'use client'

import {Card, CardBody, CardSubtitle, CardTitle, ListGroup, ListGroupItem} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";
import {IResult, UAParser} from 'ua-parser-js';
import {Job, ResultType, Status, Task} from "@/app/components/entities/job.entity";
import Image from "next/image";
import {AuthProps} from "@/app/components/auth";

export default function ClientEmpty({jwt, user}: AuthProps) {
    /* Default Job if no Active Job */
    const noJob: Job = {
        id: 0,
        name: 'No Active Job',
        status: Status.PENDING,
        progress: 0,
        totalTasks: 0,
        taskBatchSize: 0,
        taskTimeOut: 0,
        language: 2,
        resultType: ResultType.VALUE,
        startTime: null,
        endTime: null,
        runTimeMS: 0
        //wasm: string,
        //finalResult?: any
    }

    const backendURL: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;

    const [activeJob, setActiveJob] = useState<Job>(noJob)
    const workerRef = useRef<Worker>()
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any>(null)

    /* Connect as Worker to Backend Socket */
    const connectSocket = () => {
        const newSocket = io(backendURL, {auth: {token: jwt}})
        newSocket.on("connect", () => {
            if (socket != null) {
                socket.disconnect()
                console.log("Disconnecting old Socket connection...")
            }
            setSocket(newSocket)
            setIsConnected(true)
            console.log("Socket connected")
            newSocket.emit("client-info", UAParser())
        })

        newSocket.on('disconnect', () => {
            console.log("Socket connection disconnected")
            setIsConnected(false)
        })

        newSocket.on('job-activated', (job: Job) => {
            console.log(`Job Activated: #${job.id}`)
            if (activeJob.id != job.id) {
                setActiveJob(job)
            }
        })

        newSocket.on('next-task', (task: Task) => {
            console.log(`Received Task: #${task.id}`)
            // TODO Check if task.jobId == activeJob.id | in this line activeJob is 'noJob'
            if (workerRef && workerRef.current) {
                workerRef.current.postMessage({
                    eventType: 'RUN',
                    eventData: task
                });
            } else {
                console.log('Can Not Run Task')
            }
        })

        newSocket.on('no-task', (job: Job) => {
            console.log(`No Available Tasks for Job: #${job.id}`)
            /* Check if Job is DONE*/
            if (Status[job.status] === 'DONE') {
                // TODO: Display Job Done
                console.log(`Job #${job.id} is DONE`)
            } else {
                /* Request new Task after Job-Timeout (+ random sec between 1 - 10) */
                const delayInMS = (job.taskTimeOut + Math.floor(Math.random() * 10) + 1) * 1000
                console.log(`Waiting for ${delayInMS}ms`)
                setInterval(() => {
                    console.log(`Requesting new Task for Job: #${job.id}`)
                    newSocket.emit('request-task')
                }, delayInMS)
            }
        })
    }

    /* Create Web Worker */
    const createWebWorker = () => {
        /* Only Create Worker if activeJob is set */
        if(activeJob.id !== noJob.id) {
            /* Terminate previous Worker */
            if (workerRef && workerRef.current) {
                workerRef.current.terminate()
            }
            /* Create Worker for Programming Language */
            switch (activeJob.language) {
                case 0:
                    /* C_CPP*/
                    workerRef.current = new Worker('wasm_worker_c.js')
                    break
                case 1:
                    /* GO */
                    workerRef.current = new Worker('wasm_exec.js')
                    break
                case 2:
                    /* PYTHON */
                    workerRef.current = new Worker('wasm_worker_py.js')
                    break
                default:
                    /* Default is GO */
                    workerRef.current = new Worker('wasm_exec.js')
                    break
            }
            /* Setup WASM environment with activeJob Files */
            console.log('Setup WASM environment for activeJob')
            workerRef.current.postMessage({
                eventType: 'INIT',
                eventData: backendURL + '/wasm/' + activeJob.name + '/' + activeJob.name
            });
            workerRef.current.onmessage = function(event) {
                const { eventType, eventData } = event.data;
                switch (eventType) {
                    case 'INIT':
                        /* Webworker successfully initialized and Socket connected */
                        if (eventData && socket) {
                            socket.emit('worker-ready')
                        }
                        break;
                    case 'RUN':
                        /* WASM successfully executed and Socket connected */
                        if (eventData && socket) {
                            switch (activeJob.resultType) {
                                case ResultType.VALUE:
                                    socket.emit('client-result', eventData)
                                    break;
                                case ResultType.PNG:
                                    /* Result is a PNG file as binary Object */
                                    eventData.result = new Blob([eventData.result], {type: 'image/png'});
                                    socket.emit('client-result', eventData)
                                    break;
                                default:
                                    /* Default case forwards result like VALUE-case */
                                    socket.emit('client-result', eventData)
                                    break;
                            }
                        }
                        break;
                    default:
                        console.log('Worker cant process given Event')
                }
            };
        }
    }

    useEffect(() => {
        connectSocket()
    }, [])

    useEffect(() => {
        createWebWorker()
    }, [activeJob]);

    return (
        <div>
            <h1>Your Device is part of the DOINC cluster and will be used for crowd computing.</h1>
            <p>{
                isConnected ?
                    "Connection to Server Successfull" :
                    "Connection to Server Failed"
            }</p>
            <p>{activeJob.name}</p>
        </div>
    )
}
