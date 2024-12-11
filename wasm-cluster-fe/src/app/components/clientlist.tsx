import {Badge, Card, CardBody, CardHeader, CardSubtitle, CardTitle, ListGroup, ListGroupItem} from "react-bootstrap";
import {Client} from "@/app/components/entities/client.entity";

type ClientListProps = {
    clients: Client[];
}

export default function Clientlist({ clients }: ClientListProps) {
    return(
        <Card className='list-container-small'>
            <CardHeader>
                <CardTitle>Connected Clients</CardTitle>
                <CardSubtitle>Number of connected Clients: {clients.length}</CardSubtitle>
            </CardHeader>
            <CardBody>
                {
                    clients.length > 0 ?
                        <ListGroup style={{marginTop: '20px'}}>
                            {
                                clients.map((client: Client) => (
                                    <ListGroupItem key={client.id} >
                                        {
                                            client.info ?
                                                <>
                                                    <span style={{
                                                        fontFamily: 'monospace',
                                                        backgroundColor: '#eee',
                                                        borderRadius: '5px',
                                                        display: 'inline-block',
                                                        padding: '8px'
                                                    }}>{client.info.browser.name} ({client.info.browser.version})
                                                        @ <i>{client.info.os.name}</i>
                                                    </span>
                                                    {client.ready ? 'READY' : 'NOT_READY'}
                                                    <br></br>
                                                    <Badge pill bg="info">{client.info.cpu.architecture}</Badge>
                                                    {client.info.device.model}  {client.info.device.type} {client.info.device.vendor}
                                                </>
                                                :
                                                <p>Undetected User Agent</p>
                                        }
                                    </ListGroupItem>
                                ))
                            }
                        </ListGroup>
                         :
                        <p>Currently no connected Clients</p>
                }
            </CardBody>
        </Card>
    )
}
