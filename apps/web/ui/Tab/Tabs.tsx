import TabPanel, { Item } from "devextreme-react/tab-panel";
import { useState } from "react";
import "./tabs.css";
import { TabDetail } from "@/lib/definition";

interface TabDetailsProps {
  tabsDetails: TabDetail[]; 
  activeTab?: number; 
  onSelectedIndexChange?: (index: number) => void;
}

export default function Tabs({
  tabsDetails,
  activeTab,
  onSelectedIndexChange,
}: TabDetailsProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleIndexChange = (index: number) => {
    setTabIndex(index);
    onSelectedIndexChange?.(index);
  };

  return (
    <TabPanel className="w-[100%]"
      animationEnabled={true}
      selectedIndex={activeTab ?? tabIndex}
      onSelectedIndexChange={handleIndexChange}
    >
      {tabsDetails.map((tab, index) => {
        const { Component, props, title } = tab;
        return (
          <Item key={index} title={title}>
            {Component ? <Component {...props} /> : null}
          </Item>
        );
      })}
    </TabPanel>
  );
}
