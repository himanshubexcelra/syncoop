import { useEffect, useState, useContext } from "react";
import { Popup as CartPopup } from "devextreme-react/popup";
import CartDetails from '../Libraries/CartDetails';
import { Messages } from "@/utils/message";
import { DeleteMoleculeCart, MoleculeStatusCode, UserData } from '@/lib/definition';
import { getMoleculeCart, deleteMoleculeCart } from '../Libraries/service';
import { AppContext } from "../../app/AppState";
import toast from "react-hot-toast";
import {
    isProtocolAproover,
    isSystemAdmin,
} from '@/utils/helpers';
type CartPopupProps = {
    createPopupVisible: boolean;
    setCreatePopupVisibility: (visible: boolean) => void;
    userData: UserData;
    library_id: number,
    containsProjects: boolean;
    containsMoleculeOrder: boolean
    setOrderData: (msg: string, visible: boolean) => void;
    popupPosition: object;
};

const CartPopupComponent = ({
    createPopupVisible, setCreatePopupVisibility, userData, library_id, containsProjects,
    containsMoleculeOrder, setOrderData, popupPosition
}: CartPopupProps) => {
    const [loader, setLoader] = useState(false);
    const [cartData, setCartData] = useState([]);
    const { myRoles } = userData;
    const context: any = useContext(AppContext);
    const appContext = context.state;
    useEffect(() => {
        const fetchCartData = async () => {
            setLoader(true)
            let params: object = {
                user_id: userData.id
            }
            if (containsMoleculeOrder &&
                (isSystemAdmin(myRoles) || isProtocolAproover(myRoles))) {
                params = {
                    ...params,
                    lab_job_cart: true,
                    source: 'cart'
                }
            }
            const cartDataAvaialable: any = await getMoleculeCart(params);
            setCartData(cartDataAvaialable);
            setLoader(false)
        };
        fetchCartData();
    }, [library_id, userData.id]);
    const removeItemFromCart = (obj: DeleteMoleculeCart) => {
        const { molecule_id, library_id, project_id, created_by } = obj;
        const moleculeStatus = containsProjects ?
            MoleculeStatusCode.New : MoleculeStatusCode.Validated;
        deleteMoleculeCart(created_by, moleculeStatus, molecule_id, library_id, project_id).
            then((res) => {
                if (res) {
                    const filteredData = cartData.filter((item: any) =>
                        !(
                            item.molecule_id === molecule_id &&
                            item.library_id === library_id &&
                            item.project_id === project_id
                        )
                    );

                    context?.addToState({
                        ...appContext,
                        cartDetail: [...filteredData],
                        refreshCart: !appContext.refreshCart,
                    })
                    const message = Messages.deleteMoleculeMessage(molecule_id);
                    toast.success(message);
                    setCartData(filteredData);
                    if (filteredData.length == 0) {
                        setCreatePopupVisibility(false);
                    }
                }
            }).catch((error) => {
                console.log(error);
            })
    }
    const removeAll = (user_id: number, type: string, msg: string) => {
        let moleculeStatus = containsProjects ?
            MoleculeStatusCode.New : MoleculeStatusCode.Validated;
        if (type == "SubmitOrder") {
            moleculeStatus = MoleculeStatusCode.Ordered
        }
        if (type == "LabJobOrder") {
            moleculeStatus = MoleculeStatusCode.InProgress
        }

        deleteMoleculeCart(user_id, moleculeStatus).then((res) => {

            if (res) {
                setCartData([]);
                context?.addToState({
                    ...appContext,
                    cartDetail: [],
                    refreshCart: !appContext.refreshCart,

                })
                if (type === 'RemoveAll') {
                    setCreatePopupVisibility(false)
                    toast.success(msg);
                }
                else {
                    setCreatePopupVisibility(false)
                    setOrderData(msg, true)
                }

            }
        }).catch((error) => {
            console.log(error);
        })
    }
    return (
        createPopupVisible && (
            <CartPopup
                title={containsProjects ? "Molecule Cart" : "Synthesis Lab Job"}
                visible={createPopupVisible}
                onHiding={() => setCreatePopupVisibility(false)}
                contentRender={() => (
                    <CartDetails
                        cartData={cartData}
                        userData={userData}
                        removeItemFromCart={removeItemFromCart}
                        removeAll={removeAll}
                        containsProjects={containsProjects}
                        close={() => setCreatePopupVisibility(false)}
                        loader={loader}
                    />
                )}
                width={570}
                dragEnabled={false}
                height="100vh"
                position={popupPosition}
                showCloseButton={true}
                wrapperAttr={{ class: "create-popup" }}
            />
        )
    );
}

export default CartPopupComponent;
