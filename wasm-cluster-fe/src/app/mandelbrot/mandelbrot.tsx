'use client'

import InteractiveCanvas from "@/app/components/interactivecanvas";
import {Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle, DropdownButton, DropdownItem} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {AuthProps} from "@/app/components/auth";
import {Job} from "@/app/components/entities/job.entity";
import {log} from "node:util";

export default function Mandelbrot({jwt, user}: AuthProps) {
    const backendURLAPI: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;

    const [jobName, setjobName] = useState<string>('')
    const [size, setSize] = useState<number>(0);
    const [showCanvas, setShowCanvas] = useState<boolean>(false);
    const [jobs, setJobs] = useState<Job[]>([]);

    const selectGrid = (s: number, languange: string) => {
        const jname = `mandelbrot${s}x${s}-${languange}`
        setShowCanvas(checkIfJobIsDone(jname))
        setSize(s)
        setjobName(jname)
    }

    const checkIfJobIsDone = (jname: string) => {
        if (jobs.length > 0) {
            const job =  jobs.find((job) => job.name === jname)
            if (job) {
                return job?.progress > 0 && job?.progress === job?.totalTasks
            }
            return false
        }
        return false
    }

    const fetchJobs = async () => {
        const res = await fetch(backendURLAPI + '/job', {headers: {'Authorization': `Bearer ${jwt}`}})
        if (res.ok) {
            setJobs(await res.json())
        }
    }

    useEffect(() => {
        fetchJobs()
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mandelbrot Visualization</CardTitle>
                <CardSubtitle>Collectively computed by DOINC Workers</CardSubtitle>
            </CardHeader>
            <CardBody>
                <CardText>Below is a interactive graph of the Mandelbrot Set.</CardText>
                <DropdownButton title="Select Grid Option">
                    <DropdownItem onClick={() => selectGrid(2, "cpp")} >CPP: Mandelbrot 2x2</DropdownItem>
                    <DropdownItem onClick={() => selectGrid(10, "cpp")} >CPP: Mandelbrot 10x10</DropdownItem>
                    <DropdownItem onClick={() => selectGrid(2, "go")} >GO: Mandelbrot 2x2</DropdownItem>
                    <DropdownItem onClick={() => selectGrid(4, "go")} >GO: Mandelbrot 4x4</DropdownItem>
                    <DropdownItem onClick={() => selectGrid(10, "go")} >GO: Mandelbrot 10x10</DropdownItem>
                    <DropdownItem onClick={() => selectGrid(20, "go")} >GO: Mandelbrot 20x20</DropdownItem>
                    <DropdownItem onClick={() => selectGrid(100, "go")} >GO: Mandelbrot 100x100</DropdownItem>
                </DropdownButton>
                {
                    size > 0 ?
                        showCanvas ?
                            <InteractiveCanvas width={500} height={500} size={size} jobName={jobName}/>
                            :
                            <p>Sorry, seems like the Job for this grid size has not completed yet.</p>
                        :
                        <p>Select a Grid Option first</p>
                }
            </CardBody>
        </Card>
    )
}
