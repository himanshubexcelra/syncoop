"use client"

import TabPanel, { Item } from "devextreme-react/tab-panel";
import "./tabs.css"
import styles from './Tabs.module.css'
import { TabDetail } from '@/lib/definition';


interface TabDetailsProps {
    tabsDetails: TabDetail[];
}
export default function Tabs({ tabsDetails }: TabDetailsProps) {
    return (
        <div className={styles.box}>
            <TabPanel animationEnabled={true} >
                {tabsDetails.map((tab, index) => {
                    const Component = tab.Component
                    const props = tab.props
                    return (
                        <Item key={index} title={tab.title}>
                            {Component ? <Component {...props} /> : null}
                        </Item>)
                })}
            </TabPanel>
        </div>
    )
}