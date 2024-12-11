import {getJWT, logout, validateUser} from "@/app/components/auth";
import {redirect} from "next/navigation";

export async function AuthForm() {
    const jwt = getJWT()
    return (
        <>
            {
                !jwt ?
                    <form action={async (formData) => {
                        'use server'
                        if (await validateUser(formData)) {
                            redirect("/")
                        } else {
                            /* Also redirect to clear User Input */
                            redirect("/")
                        }
                    }}>
                        <div>
                            <label htmlFor="name">Name</label>
                            <br/>
                            <input id="name" name="name" placeholder="Name" style={{width: '100%'}}/>
                        </div>
                        <br/>
                        <div>
                            <label htmlFor="password">Password</label>
                            <br/>
                            <input id="password" name="password" type="password" style={{width: '100%'}}/>
                        </div>
                        <br/>
                        <button type="submit">Login</button>
                    </form>
                    :
                    <form action={async (formData) => {
                        'use server'
                        await logout()
                    }}>
                        <button type="submit">Logout</button>
                    </form>
            }
        </>
    )
}
