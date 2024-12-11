import {Job, Language, Status} from "@/app/components/entities/job.entity";
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
    ProgressBar
} from "react-bootstrap";

type JobListProps = {
    jobs: Job[];
    jwt: string;
}

export default function Joblist({ jobs, jwt }: JobListProps) {
    const backendURL: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;

    const acvtivate = async (id: number) => {
        const res = await fetch(backendURL + '/job/activate/' + id, {headers: {'Authorization': `Bearer ${jwt}`}})
        if (res.ok) {
            window.scrollTo(0, 0);
        }
    }

    return(
        <Card>
            <CardHeader>
                <CardTitle>All available Jobs</CardTitle>
            </CardHeader>
            <CardBody>
                {jobs.length == 0 ?
                    <p>No Jobs distributed</p> :
                    jobs.map((job: Job) => (
                    <Card key={job.id} className='list-item'>
                        <CardTitle>{job.name}</CardTitle>
                        <CardSubtitle className="mb-2 text-muted">
                            {job.status == Status.DONE ? <Badge bg="success">{Status[job.status]}</Badge> : ""}
                            &emsp;
                            <Badge bg="info">{Language[job.language]}</Badge>
                        </CardSubtitle>
                        <CardText>
                            Some description about this awesome task and whats its purpose! Lorem ipsum etc..
                        </CardText>
                        <div>
                            <ProgressBar variant="success" min={0} max={job.totalTasks} now={job.progress}/>
                            <p className="progress-label">{job.totalTasks > 0 ? Math.floor((job.progress / job.totalTasks) * 100) : 0}%</p>
                            <Button variant="primary" onClick={() => acvtivate(job.id)}>Activate</Button>
                        </div>
                    </Card>
                    ))}
            </CardBody>
        </Card>
    )
}
