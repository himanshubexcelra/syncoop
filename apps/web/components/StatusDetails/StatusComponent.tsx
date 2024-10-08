"use client";
import { StatusComponentProps } from "@/lib/definition"
import CountCards from "@/ui/CountCards";
import StatusCards from "@/ui/StatusCard";

export default function StatusComponent({ countCardsDetails, stats }: StatusComponentProps) {
    return (
        <div className="h-[177px] items-center flex justify-center gap-[47px]">
            <CountCards {... { countCardsDetails }} />
            <StatusCards {...{ stats }} />
        </div>
    )
}