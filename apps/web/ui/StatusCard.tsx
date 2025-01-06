/*eslint max-len: ["error", { "code": 100 }]*/
import { Status } from "@/lib/definition";
import StatusMark from "./StatusMark";
import Image from "next/image";

type StatusCardProps = {
    id: number;
    stat: Status;
    hideCount?: boolean;
    customStyles?: boolean;
};

export default function StatusCard({
    id,
    stat,
    hideCount = false,
    customStyles = false }
    : StatusCardProps) {
    return (
        <div key={id}
            className={`
                ${stat?.background} p-2 flex flex-col 
                justify-center items-center status-mark
                ${customStyles ? 'border border-neutral-200 w-[140px] h-[83px]' : ''}`}
        >
            {hideCount &&
                <div className="font-lato text-2xl font-normal">{stat?.number}</div>}
            <div className="flex items-center gap-[3px]">
                {stat?.image &&
                    <Image src={stat?.image} width={14} height={14} alt={stat?.text} />}
                <div className={`font-lato text-xs font-normal leading-normal ${stat?.textColor}`}>
                    {stat?.text}</div>
                <div className="flex gap-[3px]">
                    <StatusMark key={id} selectedStatus={stat} />
                </div>
            </div>
        </div>
    );
}
