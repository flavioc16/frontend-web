import { cookies } from "next/headers";

export function getCookiesServer(){
    const token = cookies().get("token")?.value;

    return token || null;
}