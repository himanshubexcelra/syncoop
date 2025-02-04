import { Popup as OrderPopup } from "devextreme-react/popup";
import OrderDetails from '../Libraries/OrderDetails';

type OrderPopupProps = {
    orderPopupVisible: boolean;
    setOrderPopupVisibility: (visible: boolean) => void;
    orderMsg: string;
    closeOrderPopup: () => void;
};

const OrderPopupComponent = ({
    orderPopupVisible, setOrderPopupVisibility, orderMsg, closeOrderPopup
}: OrderPopupProps) => {
    return (
        orderPopupVisible && (
            <OrderPopup
                visible={orderPopupVisible}
                onHiding={() => setOrderPopupVisibility(false)}
                contentRender={() => (
                    <OrderDetails
                        closeOrderPopup={closeOrderPopup}
                        msg={orderMsg}
                    />
                )}
                width={577}
                height={236}
                position={{ my: 'center', at: 'center', of: 'window' }}
                showCloseButton={false}
                wrapperAttr={{ class: 'order-popup' }}
                showTitle={false}
                dragEnabled={false}
                hideOnOutsideClick={false}
                style={{ backgroundColor: 'white' }}
            />
        )
    );
}

export default OrderPopupComponent;
