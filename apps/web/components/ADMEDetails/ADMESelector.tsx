/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useEffect, useState, useContext } from 'react';
import RangeSlider, { Tooltip } from 'devextreme-react/range-slider';
import Switch from 'devextreme-react/switch';
import {
    ADMEConfigTypes, ADMEProps,
    ContainerType,
    FORMULA_CONFIG, OrganizationDataFields
} from '@/lib/definition';
import toast from "react-hot-toast";
import { editOrganization, getOrganizationById } from '../Organization/service';
import { Messages } from "@/utils/message";
import { deepEqual, delay, roundValue, setConfig } from "@/utils/helpers";
import { COLOR_SCHEME, DELAY, MAX_RANGE } from "@/utils/constants";
import { LoadIndicator } from 'devextreme-react';
import { editProject } from '../Projects/projectService';
import { editLibrary } from '../Libraries/service';
import { AppContext } from "@/app/AppState";

const ADMESelector = ({ data,
    type,
    organizationId,
    setDirtyField,
    childRef,
    reset,
    fetchContainer,
    editAllowed,
    setReset,
    loggedInUser,
    isDirty,
    onSelectedIndexChange,
}: ADMEProps) => {
    const [sliderValues, setSliderValues] = useState<ADMEConfigTypes[]>([]);
    const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
    const [organizationData, setOrganizationData] = useState<OrganizationDataFields>(
        {} as OrganizationDataFields);
    const [loader, setLoader] = useState(true);
    const [inherited, setInherited] = useState(type ? data?.inherits_configuration ?? true : false);
    const [changeInheritence, setChangeInheritence] = useState(false);
    const [unit, setUnit] = useState<string[]>([]);
    const [currentId, setCurrentId] = useState<number>();
    const [editEnabled, setEditEnabled] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isLocalDirty, setIsLocalDirty] = useState(false);
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const buttonConfig = [
        {
            label: 'Update',
            class: 'primary-button',
            action: () => saveADMEConfig(),
            loader: true,
        },
        {
            label: 'Cancel',
            class: 'secondary-button ml-[10px]',
            action: () => setReset?.('reset'),
            loader: false,
        }
    ]
    const fetchData = async () => {
        setMounted(false);
        setLoader(true);
        let config;
        if (!type) {
            const orgData = await getOrganizationById({
                withRelation: [],
                id: organizationId
            });
            setOrganizationData(orgData);
            config = orgData?.config;
        } else {
            setEditEnabled(!!editAllowed);
            const inherits = data?.inherits_configuration ?? true;
            config = inherits ? data?.container?.config : data?.config;
            setInherited(inherits);
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
        setIsLocalDirty(false);
        context?.addToState({ ...appContext, refreshADME: false });
    }

    useEffect(() => {
        setMounted(true);
    }, [organizationId, data?.id, editAllowed]);

    useEffect(() => {
        if (mounted || appContext?.refreshADME) {
            fetchData();
        }
    }, [mounted, appContext?.refreshADME]);

    useEffect(() => {
        if (reset === 'reset') {
            setMounted(true);
            fetchData();
        } else if (reset === 'save') {
            saveADMEConfig();
        }
    }, [reset]);

    useEffect(() => {
        // when we change inheritence to true
        // need to do this so that individual change of rangeslider arent triggered
        if (changeInheritence) {
            const timer = setTimeout(() => {
                const rangeArray = data?.container?.config && data.container.config.ADMEParams
                    && typeof data.container.config.ADMEParams === 'object'
                    ? data.container.config.ADMEParams : setConfig();
                setSliderValues(rangeArray);
                setChangeInheritence(false);
            }, 1);
            return () => clearTimeout(timer);
        }
    }, [changeInheritence]);

    const setLocalDirtyField = (value: boolean) => {
        setDirtyField(value, 'ADME config');
        setIsLocalDirty(value);
    }

    // Update the value when the slider changes
    const handleRangeChange = (e: any, index: number) => {
        if (!inherited && !reset && !mounted) {
            // when switch to inherited or when user clicks dont save
            // bulk update happens so this shouldnt be called when 
            // individual sldiers are moved
            const selectedId = type ? data?.id : organizationData.id;
            if (selectedId && currentId === selectedId) {
                const updatedSlider: ADMEConfigTypes[] =
                    JSON.parse(JSON.stringify(sliderValues));
                const key = Object.keys(updatedSlider[index])[0];
                updatedSlider[index] = {
                    ...updatedSlider[index],
                    [key]: {
                        ...updatedSlider[index][key],
                        min: roundValue(e.start, 2),
                        max: roundValue(e.end, 2),
                    }
                };
                if (!deepEqual(updatedSlider, sliderValues)) {
                    if (!isDirty || (isDirty && isLocalDirty)) {
                        setSliderValues(updatedSlider);
                        if (!isLocalDirty) setLocalDirtyField(true);
                    } else if (onSelectedIndexChange) {
                        onSelectedIndexChange();
                    }
                } else {
                    setCurrentId(selectedId);
                }
            } else {
                setCurrentId(selectedId);
            }
        }
    };

    const getSliderBackground = (rangeValue: FORMULA_CONFIG) => {
        const minPercent = (rangeValue.min / MAX_RANGE) * 100; // Convert min to percentage
        const maxPercent = (rangeValue.max / MAX_RANGE) * 100; // Convert max to percentage
        return `linear-gradient(to right, var(--admeRed) 0%, var(--admeRed) ${minPercent}%, 
            var(--admeYellow) ${minPercent}%, var(--admeYellow) ${maxPercent}%, 
            var(--admeGreen) ${maxPercent}%, var(--admeGreen) 100%)`;
    };

    function format(value: number) {
        return `${value}`;
    }

    const saveADMEConfig = async () => {
        setLoadIndicatorVisible(true);
        let formValue;
        let response;
        let success = '';
        if (!type && isLocalDirty) {
            formValue = {
                ...organizationData, config: {
                    ...organizationData.config, ADMEParams: sliderValues
                },
                inherits_configuration: inherited
            };
            response = await editOrganization(formValue);
            success = Messages.admeConfigUpdated('organization');
        } else if (type === ContainerType.PROJECT && isLocalDirty) {
            formValue = {
                ...data, config: { ...data?.config, ADMEParams: inherited ? null : sliderValues },
                organization_id: Number(data?.parent_id), user_id: loggedInUser,
                inherits_configuration: inherited
            };
            response = await editProject(formValue);
            success = Messages.admeConfigUpdated('project');
        } else if (type === ContainerType.LIBRARY && isLocalDirty) {
            formValue = {
                ...data,
                config: { ...data?.config, ADMEParams: sliderValues },
                project_id: Number(data?.parent_id), user_id: loggedInUser,
                organization_id: organizationId,
                inherits_configuration: inherited
            };
            response = await editLibrary(formValue);
            success = Messages.admeConfigUpdated('library');
        }
        if (!response?.error) {
            setLocalDirtyField(false);
            if (type) {
                fetchContainer?.();
            }
            if (success) {
                const toastId = toast.success(success);
                await delay(DELAY);
                toast.remove(toastId);
                setLoadIndicatorVisible(false);
                context?.addToState({ ...appContext, refreshADME: true });
            }
        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
            setLoadIndicatorVisible(false);
        }
    }

    const inheritedModification = () => {
        if (!mounted && !reset) {
            if (!isDirty || (isDirty && isLocalDirty)) {
                if (!isLocalDirty) setLocalDirtyField(true);
                if (!inherited) setChangeInheritence(true);
                setInherited(!inherited);
            } else if (onSelectedIndexChange) {
                onSelectedIndexChange();
            }
        }
        setMounted(false);
    };

    return (
        <div ref={childRef} key={type ? data?.id : organizationData.id}>
            {loader ? (
                <div className="center">
                    <LoadIndicator visible={loader} />
                </div>
            ) : (
                <div className={type != ContainerType.LIBRARY ? 'p-[20px]' : ''}>
                    <div className={`flex switch-wrapper
                    ${type ? 'justify-between' : 'justify-end'}`}>
                        {type && (
                            <div className="dx-field block flex mt-2 mr-2 items-baseline">
                                <div className='pr-[10px] inherited text-greyText'>
                                    {/* {`Inherited from 
                                    ${type === ContainerType.PROJECT ? 'organization' :
                                            'project'
                                        }`} */}
                                    Inherit Values
                                </div>
                                <div>
                                    <Switch
                                        value={inherited}
                                        onValueChanged={inheritedModification}
                                        disabled={!editEnabled}
                                    />
                                </div>
                            </div>
                        )}
                        <div className='flex items-start'>
                            {buttonConfig.map((button, index) =>
                                <button key={index}
                                    className={(loadIndicatorVisible && isLocalDirty)
                                        || !isLocalDirty
                                        ? 'disableButton w-[64px] h-[37px] ml-[10px]'
                                        : button.class}
                                    onClick={() => button.action()}
                                    disabled={(loadIndicatorVisible && isLocalDirty)
                                        || !isLocalDirty}>
                                    <LoadIndicator className={
                                        `button-indicator`
                                    }
                                        visible={button.loader &&
                                            (loadIndicatorVisible && isLocalDirty)}
                                        height={20}
                                        width={20}
                                    />
                                    {(button.loader && (loadIndicatorVisible && isLocalDirty))
                                        ? ''
                                        : button.label}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className={`mt-[20px] ${!type ?
                        `grid grid-cols-1 md:grid-cols-2 gap-4` : ''}`}>
                        {sliderValues.map((range, index) => {
                            const rangeValue = Object.values(range)[0];
                            return (
                                <div key={index}>
                                    <div className='flex pl-[20px] pr-[20px]'>
                                        <div className='text-normal'>
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
                                                disabled={inherited || !editEnabled}
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
