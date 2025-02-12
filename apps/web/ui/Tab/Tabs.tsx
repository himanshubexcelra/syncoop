import TabPanel, { Item } from "devextreme-react/tab-panel";
import { useEffect, useState } from "react";
import "./tabs.css";
import { TabDetail } from "@/lib/definition";

interface TabDetailsProps {
  tabsDetails: TabDetail[];
  activeTab?: number;
  onSelectedIndexChange?: (index: number) => void;
  confirmBeforeSave?: boolean;
}

export default function Tabs({
  tabsDetails,
  activeTab,
  onSelectedIndexChange,
  confirmBeforeSave,
}: TabDetailsProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleIndexChange = (index: number) => {
    onSelectedIndexChange?.(index);
    if (!confirmBeforeSave) {
      setTabIndex(index);
    }
  };
  useEffect(() => {
    const updateTabStyles = () => {
      const tabElements = document.querySelectorAll('.dx-tab');
      tabElements.forEach((tab, index) => {
        const tabColor = tabsDetails[index]?.props?.color || 'var(--themeBlueColor)';
        (tab as HTMLElement).style.setProperty('--tab-color', tabColor);
        if (tabsDetails[index]?.props?.color) {
          (tab as HTMLElement).style.setProperty('color', activeTab === index ? tabColor : '#757575');
        }
      });
    };
    updateTabStyles();
  }, [tabsDetails]);
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
            <div style={{ background: '#ffffff' }}>
              {Component ? <Component {...props} /> : null}
            </div>
          </Item>
        );
      })}
    </TabPanel>
  );
}
