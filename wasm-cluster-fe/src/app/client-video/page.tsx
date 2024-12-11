import UserPage from "@/app/components/userpage";
import ClientVideo from "@/app/client-video/clientvideo";
import {User} from "@/app/components/entities/user.entity";

export default function ClientVideoWrapper() {
   return (
        <UserPage>
            {(jwt:string, user: User) => <ClientVideo jwt={jwt} user={user} />}
        </UserPage>
    )
}
