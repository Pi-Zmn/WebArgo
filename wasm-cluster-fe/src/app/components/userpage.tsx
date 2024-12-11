'use server'

import {getJWT, getJWTPayload} from "@/app/components/auth";
import {redirect} from "next/navigation";
import React from "react";

/* Component Checks for Session or Redirects to Login Page */
export default async function UserPage(props: any) {
    const jwt = getJWT();
    const jwtPayload = await getJWTPayload();
    if(!jwt || !jwtPayload) {
        redirect('/login')
    }
    return (
        <>
            {props.children(jwt, jwtPayload.user)}
        </>
    )
}
