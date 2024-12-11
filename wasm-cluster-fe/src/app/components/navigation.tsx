"use client"

import {Container, Navbar, NavbarBrand, NavbarCollapse, NavbarText} from "react-bootstrap";
import Image from "next/image";
import FBILogo from "../../../public/fbi-lgo.svg"

export default function Navigation() {
    return(
        <Navbar bg='light' variant='light' className='bg-body-tertiary navigation-container'>
            <Container>
                <NavbarBrand href="/">DOINC</NavbarBrand>
                <NavbarText className='navigation-text'>
                    <b>D</b>armstadt <b>O</b>pen <b>I</b>nfrastructure for <b>N</b>etwork <b>C</b>omputing
                </NavbarText>
                <NavbarCollapse className="justify-content-end">
                    <Image
                        src={FBILogo} alt={'Hochschule Darmstadt (Informatik)'}
                        className='navigation-img' priority={true}/>
                </NavbarCollapse>
            </Container>
        </Navbar>
    )
}
