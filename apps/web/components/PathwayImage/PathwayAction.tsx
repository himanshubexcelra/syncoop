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
        <div>
            <button className="zoom-in" style={
                {
                    position: 'absolute',
                    top: '50px',
                    left: '30px'
                }
            }>Zoom in</button>
            <button className="zoom-out" style={
                {
                    position: 'absolute',
                    top: '50px',
                    left: '150px'
                }
            }>Zoom out</button>
            <button className="zoom-reset" style={
                {
                    position: 'absolute',
                    top: '50px',
                    left: '300px'
                }
            }>Reset</button>
        </div>
    )
}