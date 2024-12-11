import {Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle} from "react-bootstrap";
import UserPage from "@/app/components/userpage";
import {logout} from "@/app/components/auth";
import {User} from "@/app/components/entities/user.entity";

export default function Home() {
  return (
      <UserPage>
          {(jwt: string, user: User) => {
              return (
                  <Card>
                      <CardHeader>
                          <CardTitle>Home Page</CardTitle>
                          <CardSubtitle>DOINC</CardSubtitle>
                      </CardHeader>
                      <CardBody>
                          <CardText>Some description</CardText>
                          <ul>
                              <li><a href="/">Home</a></li>
                              <li><a href="/dashboard">Dashboard</a></li>
                              <li><a href="/client">Client Page</a></li>
                              <li><a href="/client-video">Client Video Page</a></li>
                              <li><a href="/client-empty">Client Page with limited GUI</a></li>
                              <li><a href="/distribute">Distribute Page</a></li>
                              <li><a href="/mandelbrot">Mandelbrot Page</a></li>
                          </ul>
                          <br/>
                          <form action={async (formData) => {
                              'use server'
                              await logout()
                          }}>
                              <button type="submit">Logout</button>
                          </form>
                      </CardBody>
                  </Card>
              )
          }}
      </UserPage>
  );
}
