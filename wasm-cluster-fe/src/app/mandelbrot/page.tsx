import AdminPage from "@/app/components/adminpage";
import {User} from "@/app/components/entities/user.entity";
import Mandelbrot from "@/app/mandelbrot/mandelbrot";

export default function Page() {
    return (
        <AdminPage>
            {(jwt: string, user: User) => <Mandelbrot jwt={jwt} user={user} />}
        </AdminPage>
    )
}
