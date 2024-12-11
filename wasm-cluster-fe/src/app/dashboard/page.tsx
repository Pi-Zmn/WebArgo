import AdminPage from "@/app/components/adminpage";
import Dashboard from "@/app/dashboard/dashboard";
import {User} from "@/app/components/entities/user.entity";

export default function DashboardWrapper() {
    return (
        <AdminPage>
            {(jwt: string, user: User) => <Dashboard jwt={jwt} user={user} />}
        </AdminPage>
    )
}
