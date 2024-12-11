import UserPage from "@/app/components/userpage";
import Client from "@/app/client/client";
import {User} from "@/app/components/entities/user.entity";

export default function ClientWrapper() {
    return (
        <UserPage>
            {(jwt:string, user: User) => <Client jwt={jwt} user={user} />}
        </UserPage>
    )
}
