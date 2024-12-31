import React, { useEffect, useState } from 'react';
import RangeSlider, { Tooltip } from 'devextreme-react/range-slider';
import { ADMEConfigTypes, AssayTableProps, FORMULA_CONFIG, OrganizationDataFields } from '@/lib/definition';
import toast from "react-hot-toast";
import { editOrganization, getOrganizationById } from '../Organization/service';
import { Messages } from "@/utils/message";
import { delay, setConfig } from "@/utils/helpers";
import { COLOR_SCHEME, DELAY } from "@/utils/constants";
import { LoadIndicator } from 'devextreme-react';

const ADMESelector = ({ orgUser }: AssayTableProps) => {
    const [sliderValues, setSliderValues] = useState<ADMEConfigTypes[]>([]);
    const [organizationData, setOrganizationData] = useState<OrganizationDataFields>({} as OrganizationDataFields);
    const [loader, setLoader] = useState(true);
    const [unit, setUnit] = useState<string[]>([]);
    const orgId = orgUser?.id;

    const fetchData = async () => {
        const orgData = await getOrganizationById({ withRelation: [], id: orgId });
        setOrganizationData(orgData);
        const rangeArray = orgData?.config &&
            orgData.config?.ADMEParams && typeof orgData.config.ADMEParams === 'object'
            ? orgData.config.ADMEParams : setConfig();
        setSliderValues(rangeArray);
        const keys: string[] = [];
        const units: string[] = [];
        Object.entries(COLOR_SCHEME).map(([key, value]: [string, any]) => {
            const name = key.split('_')[0];
            if (!keys.includes(name)) {
                keys.push(name);
                units.push(value.unit);
            }
        });
        setUnit(units);
        setLoader(false);
    }

    useEffect(() => {
        fetchData();
    }, [orgId]);

    // Update the value when the slider changes
    const handleRangeChange = (e: any, index: number) => {
        const updatedSlider: ADMEConfigTypes[] = [...sliderValues];
        Object.keys(updatedSlider[index]).forEach(key => {
            updatedSlider[index][key].min = e.start;
            updatedSlider[index][key].max = e.end;
        });
        setSliderValues(updatedSlider);
    };

    const getSliderBackground = (rangeValue: FORMULA_CONFIG) => {
        return `linear-gradient(to right, red 0%, red ${rangeValue.min}%, yellow ${rangeValue.min}%, yellow ${rangeValue.max}%, green ${rangeValue.max}%, green 100%)`;
    };

    function format(value: number) {
        return `${value}`;
    }

    const saveADMEConfig = async () => {
        const formValue = { ...organizationData, config: { ...organizationData.config, ADMEParams: sliderValues } };
        const response = await editOrganization(formValue);
        if (!response.error) {
            const toastId = toast.success(Messages.UPDATE_ORGANIZATION);
            await delay(DELAY);
            toast.remove(toastId);
        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
        }
    }

    return (
        <div>
            {loader ? (
                <div className="center">
                    <LoadIndicator visible={loader} />
                </div>
            ) : (
                <div className='m-[20px]'>
                    <div className='flex justify-end'>
                        <button
                            className='primary-button'
                            onClick={() => saveADMEConfig()}
                        >
                            Save
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sliderValues.map((range, index) => {
                            const rangeValue = Object.values(range)[0];
                            return (
                                <div key={index}>
                                    <div className='flex items-center h-[100px] pl-[20px] pr-[20px]'>
                                        <div>
                                            <h3 className='w-[135px]'>{Object.keys(range)[0]}</h3>
                                            <div>{unit[index]}</div>
                                        </div>
                                        <div style={{ width: '100%', position: 'relative' }}>
                                            <RangeSlider
                                                defaultValue={[rangeValue.min, rangeValue.max]}
                                                min={0}
                                                max={100}
                                                step={0.1} // Step value for adjustments
                                                onValueChanged={(e) => handleRangeChange(e, index)}
                                                style={{
                                                    width: '100%',
                                                }}
                                            >
                                                <Tooltip enabled={true} format={format} showMode="always" position="bottom" />
                                            </RangeSlider>

                                            {/* Applying a custom gradient background to the slider */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '-1px',
                                                    left: '0',
                                                    right: '0',
                                                    height: '5px',
                                                    background: getSliderBackground(rangeValue),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ADMESelector;
