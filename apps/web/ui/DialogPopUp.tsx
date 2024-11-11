import { RejectedMolecules } from '@/lib/definition';
import { Popup } from 'devextreme-react/popup';

interface ContentProps {
    onClose: () => void;
    email_id?: string;
    rejected?: RejectedMolecules[];
}

interface DialogProperties {
    width?: number;
    height?: number;
}
interface MyPopupProps {
    visible: boolean;
    dialogProperties: DialogProperties;
    Content: React.ComponentType<ContentProps>;
    hidePopup: () => void;
    onSubmit?: () => void;
    contentProps?: ContentProps;
}

export default function DialogPopUp({
    visible,
    dialogProperties,
    Content,
    hidePopup,
    contentProps
}: MyPopupProps) {
    const { width, height } = dialogProperties;

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
                contentRender={() => <Content onClose={hidePopup} {...contentProps} />}
            />
        </>
    );
};
