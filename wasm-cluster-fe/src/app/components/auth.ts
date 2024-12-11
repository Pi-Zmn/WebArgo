import 'server-only'
import {jwtVerify} from "jose";
import {cookies} from "next/headers";
import {User} from "@/app/components/entities/user.entity";

const secretKey = process.env.SECRET_KEY
const encodedKey = new TextEncoder().encode(secretKey)
const backendURL: string = 'http://' + process.env.NEXT_PUBLIC_BACKEND + ':' + process.env.NEXT_PUBLIC_WS_WORKER;

interface CustomPayload {
    user: User,
    iat: number,
    exp: number
}

export async function validateUser(formData: FormData) {
    /* Get User Credentials from Form */
    const name = formData.get('name')
    const password = formData.get('password')

    /* Send User Credentials to Login-Endpoint */
    const res = await fetch(backendURL + '/user/login',
        {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                name,
                password
            })
        })
    if (res.ok) {
        /* Parse JWT from Login */
        const jwt = (await res.json()).access_token

        /* Save Sesssion in a Cookie */
        const expires = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // now + 2 days
        cookies().set('session', jwt, { expires, httpOnly: true })
        return true;
    }

    return false
}

/* Not needed since JWT is created in Backend */
/*export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2d')
        .sign(encodedKey)
}*/

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload as unknown as CustomPayload;
    } catch (error) {
        console.log('Failed to verify session')
    }
}

export function getJWT() {
    const jwt = cookies().get('session')?.value
    if (!jwt) {
        return null
    } else {
        return jwt
    }
}

export async function getJWTPayload() {
    const jwt = getJWT()
    if (!jwt) {
        return null
    } else {
        return await decrypt(jwt)
    }
}

export async function logout() {
    /* Delete Session */
    cookies().set('session', '', {expires: new Date(0)})
}

export type AuthProps = {
    jwt: string;
    user: User;
};
