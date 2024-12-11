'use client'

import {ActiveJob, Job} from "@/app/components/entities/job.entity";
import {Card, CardBody, CardSubtitle, CardTitle} from "react-bootstrap";
import Clientlist from "@/app/components/clientlist";
import {Client} from "@/app/components/entities/client.entity";
import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import Activejob from "@/app/components/activejob";
import Joblist from "@/app/components/joblist";
import {AuthProps} from "@/app/components/auth";

export default function Dashboard({jwt, user}: AuthProps) {
    const [activeJob, setActiveJob ] = useState<ActiveJob | undefined>();
    const [jobs, setJobs ] = useState<Job[]>([]);
    const [clients, setClients] = useState<Client[]>([])
    const [result, setResult] = useState<string>("");

    const backendURLSocket: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_DASHBOARD;
    const backendURLAPI: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;
    let socket: any = null

    const connectSocket = () => {
        const newSocket = io(backendURLSocket, {auth: {token: jwt}})
        newSocket.on("connect", () => {
            if (socket != null) {
                socket.disconnect()
                console.log("Disconnecting old Socket connection...")
            }
            socket = newSocket
            console.log("Socket connected")
        })

        newSocket.on('disconnect', () => {
            console.log("Socket connection disconnected")
        })

        newSocket.on('client-update', (data: Client[]) => {
            setClients(data);
        })
        newSocket.on('job-update', (data: Job[]) => {
            setJobs((data));
        })
        newSocket.on('activeJob-update', (data: ActiveJob) => {
            setActiveJob((data));
        })
        newSocket.on('activeJob-results', () => {
            getResults();
        })
    }

    const getResults = async () => {
        if (activeJob) {
            const res = await fetch(backendURLAPI + '/wasm/' + activeJob.name + '/result.txt')
            if (res.ok) {
                setResult(await res.text())
            }
        }
    }

    useEffect(() => {
        connectSocket();
    }, [])

    useEffect(() => {
        getResults();
    }, [activeJob])

    return (
        <Card>
            <CardBody>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardSubtitle>Overview of available Jobs and Connected Workers</CardSubtitle>
                <CardBody className="flex-container">
                    <div className="list-container-big">
                        {activeJob ? <Activejob activeJob={activeJob} jobResults={result} jwt={jwt} /> : <></>}
                        <Joblist jobs={jobs} jwt={jwt} />
                    </div>
                    <Clientlist clients={clients}/>
                </CardBody>
            </CardBody>
        </Card>
    )
}
