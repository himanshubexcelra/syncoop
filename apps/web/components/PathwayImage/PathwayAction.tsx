'use client'
import { useEffect } from "react"

type PathwayActionProps = {
    pathwayId: string
}

export default function PathwayAction({ pathwayId }: PathwayActionProps) {

    useEffect(() => {
        const element = document.querySelector("#" + pathwayId);

        if (element?.shadowRoot?.innerHTML) {

        }
        // @ts-expect-error JSX element not proper typed
        element.addEventListener("reaction-pathway-click", (e: any) => {
            console.log("pathway-object-clicked");
            console.log(e);
        });

        const zoomInButton: any = element?.nextElementSibling?.querySelector(".zoom-in");

        // @ts-expect-error JSX element not proper typed
        zoomInButton.onclick = () => element.zoomIn();

        const zoomoutButton: any = element?.nextElementSibling?.querySelector(".zoom-out");
        // @ts-expect-error JSX element not proper typed
        zoomoutButton.onclick = () => element.zoomOut();

        const zoomReset = element?.nextElementSibling?.querySelector(".zoom-reset");
        // @ts-expect-error JSX element not proper typed
        zoomReset.onclick = () => element.zoomReset();
    }, [])

    return (
        <div style={{ textAlign: 'right', background: '#fff' }}>
            <button className="zoom-in" >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

                    <circle cx="10" cy="10" r="7" stroke="#B0B0B0" stroke-width="2" />
                    <line x1="10" y1="7" x2="10" y2="13" stroke="#B0B0B0" stroke-width="2" />
                    <line x1="7" y1="10" x2="13" y2="10" stroke="#B0B0B0" stroke-width="2" />
                    <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="#B0B0B0" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
            <button className="zoom-out" >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="7" stroke="#B0B0B0" stroke-width="2" />
                    <line x1="7" y1="10" x2="13" y2="10" stroke="#B0B0B0" stroke-width="2" />
                    <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="#B0B0B0" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
            <button className="zoom-reset" >
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M1 2.36359V8.11425M1 8.11425H6.75066M1 8.11425L5.44663 3.9351C6.76999 2.61397 8.48686 1.75872 10.3386 1.49819C12.1903 1.23767 14.0765 1.58599 15.713 2.49068C17.3495 3.39537 18.6477 4.80741 19.4119 6.51405C20.1762 8.22068 20.365 10.1295 19.9501 11.9528C19.5352 13.7761 18.5389 15.4152 17.1115 16.6231C15.684 17.831 13.9026 18.5422 12.0358 18.6497C10.1689 18.7571 8.31774 18.2549 6.76112 17.2188C5.20449 16.1827 4.02677 14.6687 3.40539 12.905" stroke="#B0B0B0" stroke-width="1.66678" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    )
}