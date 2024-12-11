import AdminPage from "@/app/components/adminpage";
import Distribute from "@/app/distribute/distribute";
import {User} from "@/app/components/entities/user.entity";

export default function DistributeWrapper() {
    return (
        <AdminPage>
            {(jwt: string, user: User) => <Distribute jwt={jwt} user={user} />}
        </AdminPage>
    )
}
