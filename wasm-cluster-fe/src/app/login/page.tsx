import {Card, CardBody, CardTitle, CardSubtitle} from "react-bootstrap";
import {AuthForm} from "@/app/components/authform";

export default function LogIn() {
    return (
        <Card className="slim-container">
            <CardBody>
                <CardTitle>Darmstadt Open Infrastructure for Network Computing</CardTitle>
                <CardSubtitle>Login</CardSubtitle>
                <CardBody>
                    <AuthForm />
                </CardBody>
            </CardBody>
        </Card>
    )
}
