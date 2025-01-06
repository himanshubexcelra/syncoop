import { Status } from "@/lib/definition";

type StatusMarkProps = {
    selectedStatus: Status
}
export default function StatusMark({ selectedStatus }: StatusMarkProps) {
    return (
        <>
            {selectedStatus && <div className={`flex gap-1 ${selectedStatus.background}`}>
                {selectedStatus.dotColorStyle.map((style, index) => {
                    return <div key={index} className={`${style} w-2.5 h-2.5 rounded-full`}></div>
                })}
            </div>}
        </>
    )
}