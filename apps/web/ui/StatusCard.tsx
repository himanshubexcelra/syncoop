import { Status } from "@/lib/definition"
import StatusMark from "./StatusMark"

export default function StatusCards({ stats }: { stats: Status[] }) {
    return (
        <div className="grid grid-cols-5">
            {stats.map((stat, index) => (
                <div key={index} className={`${stat.background} p-2 w-[120px] h-[83px] flex flex-col border border-neutral-200 justify-center items-center`}>
                    <div className="text-themeHeadingBlue font-lato text-2xl font-normal">{stat.number}</div>
                    <div className='flex items-center gap-[3px]'>
                        <div className="font-lato text-xs font-normal leading-normal">{stat.text}</div>
                        <div className="flex gap-[3px]">
                            <StatusMark status={stat.text}></StatusMark>
                        </div>
                    </div>
                </div>))}
        </div>
    )
}
