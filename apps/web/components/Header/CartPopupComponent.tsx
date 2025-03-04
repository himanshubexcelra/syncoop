/*eslint max-len: ["error", { "code": 100 }]*/
import { useEffect, useState, useContext } from "react";
import { Popup as CartPopup } from "devextreme-react/popup";
import CartDetails from '../Libraries/CartDetails';
import { Messages } from "@/utils/message";
import { DeleteMoleculeCart, MoleculeStatusCode, UserData } from '@/lib/definition';
import { getMoleculeCart, deleteMoleculeCart } from '../Libraries/service';
import { AppContext } from "../../app/AppState";
import toast from "react-hot-toast";
import {
    filterCartDataForAnalysis,
    filterCartDataForLabJob,
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
    createPopupVisible,
    setCreatePopupVisibility,
    userData,
    library_id,
    containsProjects,
    containsMoleculeOrder,
    setOrderData,
    popupPosition
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
                    analysis_cart: true,
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
        const { molecule_id, library_id, project_id, created_by, status } = obj;
        const statusType = status === MoleculeStatusCode.ValidatedInCart ?
            MoleculeStatusCode.Validated : MoleculeStatusCode.Ordered;
        const moleculeStatus = containsProjects ?
            MoleculeStatusCode.New : statusType;
        deleteMoleculeCart(created_by, moleculeStatus, [molecule_id], [library_id], [project_id]).
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

    const removeAll = async (user_id: number, type: string, msg: string) => {
        let moleculeStatus: number;

        // Helper function for handling cart deletion
        const handleDeleteCart = async (status: number, cartRecords: any[]) => {
            const res = await deleteMoleculeCart(
                user_id,
                status,
                cartRecords.map((item: any) => item.molecule_id),
                cartRecords.map((item: any) => item.library_id),
                cartRecords.map((item: any) => item.project_id),
                true
            );
            return res;
        };

        // Helper function to update the UI and state after deletion
        const updateUIAfterDeletion = (msg: string) => {
            setCartData([]);
            context?.addToState({
                ...appContext,
                cartDetail: [],
                refreshCart: !appContext.refreshCart,
            });
            setCreatePopupVisibility(false);
            setOrderData(msg, true);
        };

        try {
            if (type === "SubmitOrder" || type === "LabJobOrder") {
                moleculeStatus = type === "SubmitOrder"
                    ? MoleculeStatusCode.Ordered
                    : MoleculeStatusCode.InProgress;

                const res = await handleDeleteCart(moleculeStatus, cartData);

                if (res) {
                    updateUIAfterDeletion(msg);
                }
            } else {
                const analysisRecords = filterCartDataForAnalysis(cartData);
                const labJobRecords = filterCartDataForLabJob(cartData);

                if (!containsProjects && analysisRecords.length > 0 && labJobRecords.length > 0) {
                    // Handle sequential deletion instead of parallel
                    const analysisResult =
                        await handleDeleteCart(MoleculeStatusCode.Ordered, analysisRecords);
                    const labJobResult =
                        await handleDeleteCart(MoleculeStatusCode.Validated, labJobRecords);

                    if (analysisResult && labJobResult) {
                        updateUIAfterDeletion(msg);
                    }
                } else if (!containsProjects && analysisRecords.length > 0) {
                    moleculeStatus = MoleculeStatusCode.Ordered;
                    const res = await handleDeleteCart(moleculeStatus, analysisRecords);

                    if (res) {
                        updateUIAfterDeletion(msg);
                    }
                } else if (!containsProjects && labJobRecords.length > 0) {
                    moleculeStatus = MoleculeStatusCode.Validated;
                    const res = await handleDeleteCart(moleculeStatus, labJobRecords);

                    if (res) {
                        updateUIAfterDeletion(msg);
                    }
                } else {
                    moleculeStatus = MoleculeStatusCode.New;
                    const res = await handleDeleteCart(moleculeStatus, cartData);

                    if (res) {
                        updateUIAfterDeletion(msg);
                    }
                }
            }
        } catch (error) {
            console.error('Error in removeAll:', error);
            toast.error('An error occurred while deleting records.');
        }
    };

    return (
        createPopupVisible && (
            <CartPopup
                title={/* containsProjects ? "Molecule Cart" :  */"Order Cart"}
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
                width={750}
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