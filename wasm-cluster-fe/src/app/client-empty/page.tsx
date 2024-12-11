import UserPage from "@/app/components/userpage";
import {User} from "@/app/components/entities/user.entity";
import ClientEmpty from "@/app/client-empty/clientempty";

export default function ClientEmptyWrapper() {
    return (
        <UserPage>
            {(jwt:string, user: User) => <ClientEmpty jwt={jwt} user={user} />}
        </UserPage>
    )
}
