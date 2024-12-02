/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import { useEffect } from "react";
import { defineCustomElements } from "@/packages/chemuix/dist/esm/loader";
import { NodeType } from "@/lib/definition";

type PathwayImageProps = {
    children: React.ReactNode,
    pathwayId: string,
    nodes: NodeType[],
    style: object,
    width?: number,
    height?: number,
}

export default function PathwayImage({
    pathwayId,
    nodes,
    children,
    style,
    width = window?.innerWidth,
    height = window?.innerHeight
}: PathwayImageProps) {

    useEffect(() => {
        defineCustomElements(window);
    }, []);

    useEffect(() => {
        const element = document.querySelector("#" + pathwayId);

        // @ts-expect-error JSX element not proper typed
        element.nodes = nodes;
    }, []);

    return (
        <div style={style}>
            {
                // @ts-expect-error JSX element not recognized
                <reaction-pathway
                    id={pathwayId}
                    nodes="display-score"
                    width={width}
                    height={height}
                    display-reaction-reference="true"
                    display-reaction-name="true"
                    display-reaction-condition="false"
                    display-honeycomb="true" />
            }
            {children}
        </div>
    );
}