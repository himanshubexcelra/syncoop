'use client'
import { useEffect } from "react"

type PathwayActionProps = {
    pathwayId: string
    selectedReaction?: (value: number, id: number) => void,
    updatedAt?: number,
}

export default function PathwayAction({ pathwayId, selectedReaction, updatedAt }: PathwayActionProps) {

    useEffect(() => {
        const element = document.querySelector("#" + pathwayId);

        if (element?.shadowRoot?.innerHTML) {

        }
        // @ts-expect-error JSX element not proper typed
        element.addEventListener("reaction-pathway-click", (e: any) => {
            if (selectedReaction) {
                selectedReaction(e.detail.eventSource?.[0], Number(pathwayId.split('-')[1]));
            }
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
    }, [updatedAt])

    return (
        <div style={{ textAlign: 'right', background: '#fff' }}>
            <button className="zoom-in" >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="7" stroke="#B0B0B0" strokeWidth="1" />
                    <line x1="10" y1="7" x2="10" y2="13" stroke="#B0B0B0" strokeWidth="1" />
                    <line x1="7" y1="10" x2="13" y2="10" stroke="#B0B0B0" strokeWidth="1" />
                    <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="#B0B0B0" strokeWidth="1" strokeLinecap="round" />
                </svg>
            </button>
            <button className="zoom-out" >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="7" stroke="#B0B0B0" strokeWidth="1" />
                    <line x1="7" y1="10" x2="13" y2="10" stroke="#B0B0B0" strokeWidth="1" />
                    <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="#B0B0B0" strokeWidth="1" strokeLinecap="round" />
                </svg>
            </button>
            <button className="zoom-reset" >
                <svg width="40" height="40" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd" stroke="#B0B0B0" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 1)">
                        <path d="m.5 7.5c0 2.7614237 2.23857625 5 5 5 2.76142375 0 5-2.2385763 5-5 0-2.76142375-2.23857625-5-5-5-1.60217594 0-3.02834512.75357449-3.94340319 1.92561913" />
                        <path d="m1.5.5v4h4" />
                        <path d="m14.5 16.5-5.379-5.379" />
                    </g>
                </svg>
            </button>
        </div>
    )
}