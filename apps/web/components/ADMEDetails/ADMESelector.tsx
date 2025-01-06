/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useEffect, useState } from 'react';
import RangeSlider, { Tooltip } from 'devextreme-react/range-slider';
import Switch from 'devextreme-react/switch';
import {
    ADMEConfigTypes, ADMEProps,
    FORMULA_CONFIG, OrganizationDataFields
} from '@/lib/definition';
import toast from "react-hot-toast";
import { editOrganization, getOrganizationById } from '../Organization/service';
import { Messages } from "@/utils/message";
import { delay, setConfig } from "@/utils/helpers";
import { COLOR_SCHEME, DELAY, MAX_RANGE } from "@/utils/constants";
import { LoadIndicator } from 'devextreme-react';
import { editProject } from '../Projects/projectService';
import { editLibrary } from '../Libraries/service';

const ADMESelector = ({ data, type, organizationId }: ADMEProps) => {
    const [sliderValues, setSliderValues] = useState<ADMEConfigTypes[]>([]);
    const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
    const [organizationData, setOrganizationData] = useState<OrganizationDataFields>(
        {} as OrganizationDataFields);
    const [loader, setLoader] = useState(true);
    const [inherited, setInherited] = useState(type ? true : false);
    const [unit, setUnit] = useState<string[]>([]);
    const orgId = organizationId;

    const fetchData = async () => {
        setLoader(true);
        let config;
        if (!type) {
            const orgData = await getOrganizationById({ withRelation: [], id: orgId });
            setOrganizationData(orgData);
            config = orgData?.config;
        } else {
            config = data?.config;
            setInherited(data?.inherits_configuration ?? true);
        }
        const rangeArray = config && config?.ADMEParams
            && typeof config.ADMEParams === 'object'
            ? config.ADMEParams : setConfig();
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

    const roundValue = (value: number, precision: number = 2) => {
        const factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    };

    // Update the value when the slider changes
    const handleRangeChange = (e: any, index: number) => {
        const updatedSlider: ADMEConfigTypes[] = [...sliderValues];
        Object.keys(updatedSlider[index]).forEach(key => {
            updatedSlider[index][key].min = roundValue(e.start, 2);
            updatedSlider[index][key].max = roundValue(e.end, 2);
        });
        setSliderValues(updatedSlider);
    };

    const getSliderBackground = (rangeValue: FORMULA_CONFIG) => {
        const minPercent = (rangeValue.min / MAX_RANGE) * 100; // Convert min to percentage
        const maxPercent = (rangeValue.max / MAX_RANGE) * 100; // Convert max to percentage
        return `linear-gradient(to right, red 0%, red ${minPercent}%, 
            yellow ${minPercent}%, yellow ${maxPercent}%, 
            green ${maxPercent}%, green 100%)`;
    };

    function format(value: number) {
        return `${value}`;
    }

    const saveADMEConfig = async () => {
        setLoadIndicatorVisible(true);
        let formValue;
        let response;
        let success = Messages.admeConfigUpdated('organization');
        if (!type) {
            formValue = {
                ...organizationData, config: {
                    ...organizationData.config, ADMEParams: sliderValues
                },
                inherits_configuration: inherited
            };
            response = await editOrganization(formValue);
        } else if (type === 'P') {
            formValue = {
                ...data, config: { ...organizationData.config, ADMEParams: sliderValues },
                organization_id: Number(data?.parent_id), user_id: data?.owner_id,
                inherits_configuration: inherited
            };
            response = await editProject(formValue);
            success = Messages.admeConfigUpdated('project');
        } else if (type === 'L') {
            formValue = {
                ...data, config: { ...organizationData.config, ADMEParams: sliderValues },
                project_id: Number(data?.parent_id), user_id: data?.owner_id,
                inherits_configuration: inherited
            };
            response = await editLibrary(formValue);
            success = Messages.admeConfigUpdated('library');
        }
        if (!response.error) {
            const toastId = toast.success(success);
            await delay(DELAY);
            toast.remove(toastId);
            setLoadIndicatorVisible(false);
        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
            setLoadIndicatorVisible(false);
        }
    }

    const inheritedModification = () => {
        setInherited(!inherited);
        setLoader(true);
        const rangeArray = data?.container?.config && data?.container?.config?.ADMEParams
            && typeof data?.container?.config.ADMEParams === 'object'
            ? data?.container?.config.ADMEParams : setConfig();
        setSliderValues(rangeArray);
        setLoader(false);
    };

    return (
        <div>
            {loader ? (
                <div className="center">
                    <LoadIndicator visible={loader} />
                </div>
            ) : (
                <div className={type != 'L' ? 'm-[20px]' : ''}>
                    <div className='flex justify-end'>
                        {type && (
                            <div className="dx-field block pr-[10px]">
                                <div>Inherited</div>
                                <div className="mt-[5px]">
                                    <Switch
                                        value={inherited}
                                        onValueChanged={inheritedModification}
                                    />
                                </div>
                            </div>
                        )}
                        <button className={
                            loadIndicatorVisible
                                ? 'disableButton w-[70px] h-[50px]'
                                : 'primary-button'}
                            onClick={() => saveADMEConfig()}
                            disabled={loadIndicatorVisible}>
                            <LoadIndicator className={
                                `button-indicator`
                            }
                                visible={loadIndicatorVisible}
                                height={20}
                                width={20}
                            />
                            {loadIndicatorVisible ? '' : 'Save'}</button>
                    </div>
                    <div className={`${!type ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
                        {sliderValues.map((range, index) => {
                            const rangeValue = Object.values(range)[0];
                            return (
                                <div key={index}>
                                    <div className='flex pl-[20px] pr-[20px]'>
                                        <div>
                                            <h3 className='w-[135px]'>{Object.keys(range)[0]}</h3>
                                            <div>{unit[index]}</div>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            position: 'relative', top: '10px'
                                        }}>
                                            <RangeSlider
                                                value={[rangeValue.min, rangeValue.max]}
                                                min={0}
                                                max={MAX_RANGE}
                                                step={0.01} // Step value for adjustments
                                                onValueChanged={(e) => handleRangeChange(e, index)}
                                                style={{
                                                    width: '100%',
                                                }}
                                                disabled={inherited}
                                            >
                                                <Tooltip enabled={true} format={format}
                                                    showMode="always" position="bottom" />
                                            </RangeSlider>

                                            {/* Applying a custom gradient 
                                            background to the slider */}
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
