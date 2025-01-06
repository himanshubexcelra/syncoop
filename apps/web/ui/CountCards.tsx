import Image from "next/image"
import { CountCard } from "@/lib/definition";
import Link from "next/link";

export default function CountCards({ countCardsDetails }: { countCardsDetails: CountCard[] }) {
    return (
        <>
            {
                countCardsDetails.map((d, index) => (
                    d.href ? (
                        <Link key={index} href={d.href}>
                            <div className={`flex items-center ${d.innerGap}`}>
                                <Image src={d.svgPath}
                                    width={30}
                                    height={30}
                                    alt="organization" />
                                <div className="flex flex-col">
                                    <div className="text-foreground font-lato text-3xl font-normal leading-normal">{d.count}</div>
                                    <div className="text-foreground font-lato text-base font-normal leading-normal">{d.name}</div>
                                </div>
                            </div>
                        </Link>
                    ) :
                        <div key={index} className={`flex items-center ${d.innerGap}`}>
                            <Image src={d.svgPath}
                                width={30}
                                height={30}
                                alt="organization" />
                            <div className="flex flex-col">
                                <div className="text-foreground font-lato text-3xl font-normal leading-normal">{d.count}</div>
                                <div className="text-foreground font-lato text-base font-normal leading-normal">{d.name}</div>
                            </div>
                        </div>))
            }
        </>)
}