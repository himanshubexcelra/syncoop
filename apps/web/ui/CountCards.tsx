import Image from "next/image"
import { CountCard, } from "@/lib/definition"

export default function CountCards({ countCardsDetails }: { countCardsDetails: CountCard[] }) {
    return (<div className="flex gap-[132px]">
        {countCardsDetails.map((d, index) => (
            <div key={index} className={`flex items-center ${d.innerGap}`}>
                <Image src={d.svgPath}
                    width={30}
                    height={30}
                    alt="organization" />
                <div className="flex flex-col">
                    <div className="text-foreground font-lato text-3xl font-normal leading-normal">{d.count}</div>
                    <div className="text-foreground font-lato text-base font-normal leading-normal">{d.name}</div>
                </div>
            </div>))}
    </div>)
}