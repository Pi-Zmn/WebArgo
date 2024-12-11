import {ActiveJob, Language, Status, Task} from "@/app/components/entities/job.entity";
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
    ListGroup,
    ListGroupItem,
    ProgressBar,
    Toast,
    ToastBody,
    ToastContainer,
    ToastHeader
} from "react-bootstrap";
import {useEffect, useState} from "react";

type ActiveJobProps = {
    activeJob: ActiveJob;
    jobResults: string;
    jwt: string;
}

export default function Activejob({ activeJob, jobResults, jwt }: ActiveJobProps) {
    const [tasksDone, setTasksDone] = useState<number>(0);
    const [tasksRunning, setTasksRunning] = useState<number>(0);
    const [showToast, setShowToast] = useState(false)
    const [toastText, setToastText] = useState("")


    const backendURL: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;
    const startjob = async () => {
        const res = await fetch(backendURL + '/job/start', {headers: {'Authorization': `Bearer ${jwt}`}})
        if (res.ok) {
            /* Show Toast with Text */
            setShowToast(true)
            setToastText(`Successfully STARTED Job ${activeJob.name} #${activeJob.id}`)
        }
    }
    const stoptjob = async () => {
        const res = await fetch(backendURL + '/job/stop', {headers: {'Authorization': `Bearer ${jwt}`}})
        if (res.ok) {
            /* Show Toast with Text */
            setShowToast(true)
            setToastText(`Successfully STOPPED Job ${activeJob.name} #${activeJob.id}`)
        }
    }
    const resetJob = async () => {
        const res = await fetch(backendURL + '/job/reset', {headers: {'Authorization': `Bearer ${jwt}`}})
        if (res.ok) {
            /* Show Toast with Text */
            setShowToast(true)
            setToastText(`Successfully RESET Job ${activeJob.name} #${activeJob.id}`)
        }
    }

    const calculateValues = () => {
        if (activeJob.tasks){
            let tD = 0
            let tR = 0
            activeJob.tasks.forEach((t: Task) => {
                if (t.done) {
                    tD += 1
                } else if (t.scheduledAt) {
                    tR += 1
                }
            })
            setTasksDone(tD)
            setTasksRunning(tR)
        }
    }

    const hideToast = () => setShowToast(false)

    useEffect(() => {
        calculateValues()
    }, [activeJob]);

    return(
        <>
            <ToastContainer className="p-5" position={"top-center"}>
                <Toast autohide delay={5000} show={showToast} onClose={hideToast}>
                    <ToastHeader>
                        <strong className="me-auto">Job Information</strong>
                        <Badge bg='success'>Information</Badge>
                    </ToastHeader>
                    <ToastBody>{toastText}</ToastBody>
                </Toast>
            </ToastContainer>
            <Card style={{marginBottom: "20px"}}>
                <CardHeader>
                    <CardTitle>{activeJob.name}</CardTitle>
                    <CardSubtitle>
                        {Status[activeJob.status]}
                        &emsp;
                        <Badge bg="info">{Language[activeJob.language]}</Badge>
                    </CardSubtitle>
                </CardHeader>
                <CardBody>
                    {
                        activeJob.status == Status.DONE ?
                            <>
                                <ProgressBar variant="primary" now={100} key={1}/>
                                <p className="progress-label">{activeJob.progress}/{activeJob.totalTasks}</p>
                                <ListGroup style={{marginTop: '20px'}}>
                                    <ListGroupItem>
                                        Run Time:&emsp;&emsp;&emsp;
                                        {activeJob.runTimeMS / 60000} min
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        Run Time:&emsp;&emsp;&emsp;
                                        {activeJob.runTimeMS / 1000} s
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        Run Time:&emsp;&emsp;&emsp;
                                        {activeJob.runTimeMS} ms
                                    </ListGroupItem>
                                </ListGroup>
                            </>
                            :
                            <>
                                <ListGroup style={{marginTop: '20px'}}>
                                    <ListGroupItem>
                                        Tasks Done:&emsp;&emsp;&emsp;
                                        {activeJob.progress + tasksDone}
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        Tasks Scheduled:&emsp;&emsp;&emsp;
                                        {tasksRunning}
                                    </ListGroupItem>
                                </ListGroup>
                                <br></br>
                                <ProgressBar>
                                    <ProgressBar striped variant="success"
                                                 min={0}
                                                 max={activeJob.totalTasks}
                                                 now={activeJob.progress + tasksDone}
                                                 key={1}/>
                                    <ProgressBar animated variant="info"
                                                 min={0}
                                                 max={activeJob.totalTasks}
                                                 now={tasksRunning} key={2}/>
                                </ProgressBar>
                                <p className="progress-label">{activeJob.progress + tasksDone}/{activeJob.totalTasks}</p>
                            </>
                    }
                    <div className="button-container">
                        <div className="button-float-left">
                            <Button variant="success" onClick={startjob}
                                    disabled={activeJob.status == Status.DONE || activeJob.status == Status.RUNNING}>
                                Start
                            </Button>
                            <Button className="button-float-left-stop" variant="danger" onClick={stoptjob}
                                    disabled={activeJob.status == Status.DONE || activeJob.status == Status.STOPPED}>
                                Stop
                            </Button>
                        </div>
                        <Button variant="warning" onClick={resetJob} className="button-float-right"
                                disabled={activeJob.status == Status.RUNNING}>
                            Reset
                        </Button>
                    </div>
                    <br></br>
                    <CardText>
                        Some description about this awesome task and whats its purpose! Lorem ipsum etc..
                    </CardText>
                    <h2>Results:</h2>
                    <textarea
                        cols={30}
                        rows={10}
                        value={jobResults}
                        readOnly={true}
                        style={{marginTop: 15, width: "50%"}}
                    ></textarea>
                </CardBody>
            </Card>
        </>
    )
}
