'use client'

import {
    Button,
    Card,
    CardBody,
    CardSubtitle,
    CardTitle,
    Form,
    FormControl,
    FormGroup,
    FormLabel,
    FormSelect,
    FormText
} from "react-bootstrap";
import {Job, Language, ResultType, Status} from "@/app/components/entities/job.entity";
import {useState} from "react";
import {AuthProps} from "@/app/components/auth";

export default function Distribute({jwt, user}: AuthProps) {
    const newJob: Job = {
        id: 0,
        name: '',
        status: Status.PENDING,
        progress: 0,
        totalTasks: 0,
        taskBatchSize: 0,
        taskTimeOut: 0,
        language: 1,                    /* Go as Default */
        resultType: ResultType.VALUE,   /* VALUE as Default */
        startTime: null,
        endTime: null,
        runTimeMS: 0
        //wasm: string,
        //finalResult?: any
    }

    const backendURL: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;

    const [name, setName] = useState<string>('')
    const [language, setLanguage] = useState<number>(0)
    const [taskBatchSize, setTaskBatchSize] = useState<number>(0)
    const [taskTimeOut, setTaskTimeOut] = useState<number>(0)
    const [wasmFile, setWasmFile] = useState()
    const [gluecodeFile, setGluecodeFile] = useState()

    return (
        <Card className="slim-container">
            <CardBody>
                <CardTitle>Distribute a Job To DOINC</CardTitle>
                <CardSubtitle>Define all Attributes of the Job</CardSubtitle>
                <CardBody>
                    <Form onSubmit={(event) => {
                        event.preventDefault()
                        newJob.name = name
                        newJob.language = language
                        newJob.taskBatchSize = taskBatchSize
                        newJob.taskTimeOut = taskTimeOut
                        console.log(newJob)
                        // TODO: Send Post to Backend
                        /*fetch(backendURL + '/job', {
                            method: 'POST',
                            headers: {'Content-Type':'application/json'},
                            body: JSON.stringify(newJob)
                        })*/
                    }}>
                        <FormGroup className="mb-3" controlId="jobname">
                            <FormLabel>Name</FormLabel>
                            <FormControl type="text" placeholder="Name to identify the Job" required
                                         onChange={event => setName(event.target.value)} />
                        </FormGroup>

                        <FormGroup className="mb-3" controlId="joblanguage">
                            <FormLabel>Programming Language</FormLabel>
                            <FormSelect required onChange={event => (setLanguage(Number(event.target.value)))}>
                                {Object.keys(Language).filter(key => !isNaN(Number(key))).map((language) => (
                                    <option key={language} value={language}>{Language[Number(language)]}</option>
                                ))}
                            </FormSelect>
                            <FormText className="text-muted">
                                DOINC supports these Programming Languages as WASM Target
                            </FormText>
                        </FormGroup>

                        <FormGroup className="mb-3" controlId="taskbatchsize">
                            <FormLabel>Batch Size for Tasks</FormLabel>
                            <FormControl type="number" placeholder="Batch Size" required
                                         onChange={event => (setTaskBatchSize(Number(event.target.value)))}/>
                            <FormText className="text-muted">
                                Choose the Batch Size of Tasks that are loaded into the DONIC Master-Server context.
                                <br></ br>
                                After all Tasks of the Batch are completed each result will be persistently saved on
                                the Master-Server and a new Batch is loaded into the context.
                            </FormText>
                        </FormGroup>

                        <FormGroup className="mb-3" controlId="tasktimeout">
                            <FormLabel>Timeout in seconds for each Task</FormLabel>
                            <FormControl type="number" placeholder="Timeout in seconds" required
                                         onChange={event => {setTaskTimeOut(Number(event.target.value))}}/>
                            <FormText className="text-muted">
                                Task will be rescheduled after the Timeout.
                            </FormText>
                        </FormGroup>

                        <FormGroup className="mb-3" controlId="jobwasm">
                            <FormLabel>WebAssembly File (WebAssembly.wasm)</FormLabel>
                            <FormControl type="file" disabled />
                        </FormGroup>

                        {
                            Language[language] == 'C_CPP' ?
                                <FormGroup className="mb-3" controlId="jobgluecode">
                                    <FormLabel>JavaScript Gluecode File (Gluecode.js)</FormLabel>
                                    <FormControl type="file" disabled />
                                    <FormText className="text-muted">
                                        A JavaScript file to setup the WebAssembly Environment.
                                        <br></br>
                                        Required for some Programming Languages.
                                    </FormText>
                                </FormGroup> :
                                <></>
                        }

                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </CardBody>
            </CardBody>
        </Card>
    )
}
