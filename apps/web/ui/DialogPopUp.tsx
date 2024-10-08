import { Popup } from 'devextreme-react/popup';

interface ContentProps {
    onClose: () => void;
}
interface DialogProperties {
    width?: number;
    height?: number;
}
interface MyPopupProps {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    dialogProperties: DialogProperties;
    Content: React.ComponentType<ContentProps>;
}

export default function DialogPopUp({ visible, setVisible, dialogProperties, Content }: MyPopupProps) {
    const { width, height } = dialogProperties;
    const hidePopup = () => {
        setVisible(false);
    };
    return (
        <>
            <Popup
                visible={visible}
                showTitle={false}
                onHiding={hidePopup}
                dragEnabled={false}
                showCloseButton={true}
                width={width}
                height={height}
                contentRender={() => <Content onClose={hidePopup} />}
            />
        </>
    );
};
