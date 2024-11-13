import { StatusCode } from "@/lib/definition";

export default function StatusMark({ status }: { status: string | StatusCode }) {
    return (
        <>
            {status === StatusCode.NEW && <div className="flex gap-1 bg-white">
                <div className={`bg-themeDotGreyColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreyColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreyColor w-2.5 h-2.5 rounded-full`}></div>
            </div>
            }
            {status === StatusCode.READY && <div className="flex gap-1 bg-white">
                <div className={`bg-themeDotBlueColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreyColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreyColor w-2.5 h-2.5 rounded-full`}></div>
            </div>
            }
            {status === StatusCode.INPROGRESS && <div className="flex gap-1 bg-themeStatsBlueColor">
                <div className={`bg-themeDotBlueColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotBlueColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreyColor w-2.5 h-2.5 rounded-full`}></div>
            </div>
            }
            {status === StatusCode.FAILED && <div className="flex gap-1 bg-themeStatsRedColor">
                <div className={`bg-themeDotRedColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotRedColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotRedColor w-2.5 h-2.5 rounded-full`}></div>
            </div>
            }
            {status === StatusCode.DONE && <div className="flex gap-1 bg-themeStatsGreenColor">
                <div className={`bg-themeDotGreenColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreenColor w-2.5 h-2.5 rounded-full`}></div>
                <div className={`bg-themeDotGreenColor w-2.5 h-2.5 rounded-full`}></div>
            </div>
            }
        </>
    )
}