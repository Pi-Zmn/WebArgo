'use server'

import {getJWT, getJWTPayload} from "@/app/components/auth";
import {redirect} from "next/navigation";
import React from "react";
import {UserRole} from "@/app/components/entities/user.entity";

/* Component Checks for Session and User Role or Redirects to Login Page */
export default async function AdminPage(props: any) {
    const jwt = getJWT();
    const jwtPayload = await getJWTPayload();
    if(!jwt || !jwtPayload) {
        redirect('/login')
    }
    if (jwtPayload.user.role === UserRole.Admin) {
        return (
            <>
                {props.children(jwt, jwtPayload.user)}
            </>
        )
    } else {
        return (
            <div>
                <h1>This Page is only available for User with Role: <i>Admin</i></h1>
            </div>
        )
    }
}
