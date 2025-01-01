import { getCookie } from "cookies-next";

export function getCookieClient(){
    const token = getCookie("token")

    return token;
}